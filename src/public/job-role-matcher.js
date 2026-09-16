(function () {
  const panel = document.querySelector("[data-matcher]");
  if (!panel) {
    return;
  }

  const form = document.getElementById("matcher-form");
  const questions = Array.from(panel.querySelectorAll("[data-matcher-question]"));
  const progressLabel = panel.querySelector("[data-matcher-progress]");
  const progressBar = panel.querySelector("[data-matcher-progress-bar]");
  const backBtn = panel.querySelector("[data-matcher-back]");
  const nextBtn = panel.querySelector("[data-matcher-next]");
  const submitBtn = panel.querySelector("[data-matcher-submit]");
  const answersInput = panel.querySelector("[data-matcher-answers-input]");

  if (!form || questions.length === 0) {
    return;
  }

  let currentIndex = 0;

  const isAnswered = (question) =>
    Boolean(question.querySelector("[data-matcher-option]:checked"));

  const render = () => {
    questions.forEach((question, index) => {
      question.hidden = index !== currentIndex;
    });

    if (progressLabel) {
      progressLabel.textContent = `Question ${currentIndex + 1} of ${questions.length}`;
    }
    if (progressBar) {
      progressBar.style.width = `${((currentIndex + 1) / questions.length) * 100}%`;
    }

    backBtn.hidden = currentIndex === 0;

    const isLastQuestion = currentIndex === questions.length - 1;
    nextBtn.hidden = isLastQuestion;
    submitBtn.hidden = !isLastQuestion;
  };

  const goToNext = () => {
    const currentQuestion = questions[currentIndex];
    if (!isAnswered(currentQuestion)) {
      const firstOption = currentQuestion.querySelector("[data-matcher-option]");
      if (firstOption && typeof firstOption.reportValidity === "function") {
        firstOption.reportValidity();
      }
      return;
    }
    if (currentIndex < questions.length - 1) {
      currentIndex += 1;
      render();
    }
  };

  const goToBack = () => {
    if (currentIndex > 0) {
      currentIndex -= 1;
      render();
    }
  };

  const collectAnswers = () =>
    questions.map((question) => {
      const questionId = Number(question.getAttribute("data-question-id"));
      const checked = question.querySelector("[data-matcher-option]:checked");
      return { questionId, agreement: Number(checked.value) };
    });

  nextBtn.addEventListener("click", goToNext);
  backBtn.addEventListener("click", goToBack);

  form.addEventListener("submit", (event) => {
    const lastQuestion = questions[questions.length - 1];
    if (!isAnswered(lastQuestion)) {
      event.preventDefault();
      return;
    }
    answersInput.value = JSON.stringify(collectAnswers());
  });

  render();
})();
