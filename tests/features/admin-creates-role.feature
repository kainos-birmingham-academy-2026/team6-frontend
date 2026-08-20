
Scenario: admin is able to create a new role
    Given the admin logs in and is on the job-roles page
    When the admin clicks the button add a new role
    Then the job role page displays a new role section with the required fields
    When the admin enters all the fields
    And selects the add new role button
    Then the new job role is created and displayed on the job roles page


Scenario: user applies for a job on the job roles page
    Given that the user has registered an account and logged in 
    When the user clicks on the job roles page
    Then the user selects the job role they want to apply for
    And the job role detail page is displayed
    When the user clicks the apply job role button
    Then the apply job page is shown
    When user uploads their CV
    And clicks the submit button
    Then a confirmation message is displayed 
