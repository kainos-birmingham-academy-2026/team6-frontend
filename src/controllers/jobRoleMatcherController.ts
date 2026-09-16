import type { Request, Response } from "express";
import { BackendRequestError } from "../services/jobRoleService";
import {
  jobRoleMatcherService,
  type MatcherAnswer,
  type MatcherQuestion
} from "../services/jobRoleMatcherService";

const AGREEMENT_OPTIONS = [
  { value: -2, label: "Strongly disagree" },
  { value: -1, label: "Disagree" },
  { value: 0, label: "Neutral" },
  { value: 1, label: "Agree" },
  { value: 2, label: "Strongly agree" }
];

const CAPABILITY_ICONS: Record<string, string> = {
  engineering: "</>",
  "software engineering": "</>",
  "backend engineering": "</>",
  "cloud and engineering": "</>",
  data: "◧",
  "data & ai": "◧",
  "data and ai": "◧",
  design: "✎",
  "experience design": "✎",
  "user-centred design": "✎",
  workday: "⬡",
  product: "◆",
  delivery: "◆",
  "delivery & product": "◆"
};

const capabilityIcon = (name: string): string =>
  CAPABILITY_ICONS[name.trim().toLowerCase()] ?? "✦";

// Stable per-capability accent so a capability always keeps the same card colour.
const capabilityAccent = (name: string): number => {
  let hash = 0;
  for (const character of name) {
    hash = (hash * 31 + character.charCodeAt(0)) % 5;
  }
  return hash + 1;
};

const formatDateToDayMonthYear = (value?: string): string => {
  if (!value) {
    return "N/A";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  const day = String(parsed.getUTCDate()).padStart(2, "0");
  const month = String(parsed.getUTCMonth() + 1).padStart(2, "0");
  const year = String(parsed.getUTCFullYear()).slice(-2);

  return `${day}/${month}/${year}`;
};

const redirectToLoginOnAuthFailure = (error: unknown, req: Request, res: Response): boolean => {
  if (error instanceof BackendRequestError && error.statusCode === 401) {
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.redirect("/login");
    });
    return true;
  }
  return false;
};

// Accepts either repeated answers[n][questionId] fields (native form post) or a JSON blob.
const parseSubmittedAnswers = (
  body: Record<string, unknown>,
  questions: MatcherQuestion[]
): MatcherAnswer[] | null => {
  const questionIds = new Set(questions.map((question) => question.questionId));
  const seen = new Set<number>();
  const answers: MatcherAnswer[] = [];

  const raw = body.answers;
  if (typeof raw !== "string") {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!Array.isArray(parsed)) {
    return null;
  }

  for (const entry of parsed) {
    if (
      !entry ||
      typeof entry !== "object" ||
      typeof (entry as Record<string, unknown>).questionId !== "number" ||
      typeof (entry as Record<string, unknown>).agreement !== "number"
    ) {
      return null;
    }

    const questionId = (entry as Record<string, unknown>).questionId as number;
    const agreement = (entry as Record<string, unknown>).agreement as number;

    if (!questionIds.has(questionId) || seen.has(questionId)) {
      return null;
    }
    if (!Number.isInteger(agreement) || agreement < -2 || agreement > 2) {
      return null;
    }

    seen.add(questionId);
    answers.push({ questionId, agreement });
  }

  if (seen.size !== questionIds.size) {
    return null;
  }

  return answers;
};

export class JobRoleMatcherController {
  async showQuestionnaire(req: Request, res: Response): Promise<void> {
    try {
      const questions = await jobRoleMatcherService.getQuestions(req.session.token);
      res.render("job-role-matcher.html", {
        questions,
        agreementOptions: AGREEMENT_OPTIONS,
        errorMessage: ""
      });
    } catch (error) {
      if (redirectToLoginOnAuthFailure(error, req, res)) {
        return;
      }
      res.render("job-role-matcher.html", {
        questions: [],
        agreementOptions: AGREEMENT_OPTIONS,
        errorMessage: "Unable to load the quiz right now. Please try again shortly."
      });
    }
  }

  async submitAnswers(req: Request, res: Response): Promise<void> {
    let questions: MatcherQuestion[];
    try {
      questions = await jobRoleMatcherService.getQuestions(req.session.token);
    } catch (error) {
      if (redirectToLoginOnAuthFailure(error, req, res)) {
        return;
      }
      res.render("job-role-matcher.html", {
        questions: [],
        agreementOptions: AGREEMENT_OPTIONS,
        errorMessage: "Unable to load the quiz right now. Please try again shortly."
      });
      return;
    }

    const answers = parseSubmittedAnswers(req.body, questions);
    if (!answers) {
      res.render("job-role-matcher.html", {
        questions,
        agreementOptions: AGREEMENT_OPTIONS,
        errorMessage: "Please answer every question before submitting."
      });
      return;
    }

    try {
      const result = await jobRoleMatcherService.submitAnswers(answers, req.session.token);

      const matchingRoles = result.matchingRoles.map((role, index) => {
        const capabilityDisplay = String(role.capabilityName || role.capabilityId || "N/A");
        return {
          ...role,
          detailsId: role.jobRoleId ?? index + 1,
          capabilityDisplay,
          bandDisplay: role.bandName || role.bandId || "N/A",
          closingDateDisplay: formatDateToDayMonthYear(role.closingDate),
          capabilityIcon: capabilityIcon(capabilityDisplay),
          accentClass: `cap-accent-${capabilityAccent(capabilityDisplay)}`
        };
      });

      res.render("job-role-matcher-results.html", {
        recommendations: result.recommendations,
        matchingRoles
      });
    } catch (error) {
      if (redirectToLoginOnAuthFailure(error, req, res)) {
        return;
      }

      res.render("job-role-matcher.html", {
        questions,
        agreementOptions: AGREEMENT_OPTIONS,
        errorMessage:
          error instanceof Error ? error.message : "Unable to submit your answers right now."
      });
    }
  }
}

export const jobRoleMatcherController = new JobRoleMatcherController();
