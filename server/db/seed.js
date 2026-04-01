const db = require('./db');

const appData = {
  form: {
    name: "KA3 Policy Support - European Youth Together",
    version: "1.0",
    publicationDate: "2026"
  },
  projectMeta: {
    projectName: "",
    projectType: "",
    workingVersion: ""
  },
  savedVersions: [],
  sections: [
    {
      title: "1. Relevance",
      questions: [
        {
          code: "1.1",
          title: "Background and general objectives",
          prompt: "Describe the background and general objectives of the project, explaining the needs and challenges it addresses.",
          maxScore: 10,
          threshold: 6,
          generalRules: [
            "The background must clearly justify the need for the project.",
            "General objectives must be measurable and realistic."
          ],
          scoreCaps: [
            "Maximum 10 points. Below 6 points, the section does not pass."
          ],
          miniPoints: [
            {
              title: "Clear problem identification",
              maxScore: 3,
              mandatory: true,
              meaning: "The problem is clearly identified and documented.",
              structure: "Brief description of the problem and its context.",
              relations: "Related to policy objectives and programme priorities.",
              rules: "Must include statistical or documentary evidence.",
              score: 0
            },
            {
              title: "Alignment with programme priorities",
              maxScore: 3,
              mandatory: true,
              meaning: "The project aligns with the priorities of the Erasmus+ programme.",
              structure: "Explicit reference to programme priorities.",
              relations: "Direct link between priorities and project activities.",
              rules: "At least two programme priorities must be referenced.",
              score: 0
            },
            {
              title: "Clarity of general objectives",
              maxScore: 4,
              mandatory: true,
              meaning: "The general objectives are clear, measurable, and achievable.",
              structure: "SMART objectives (Specific, Measurable, Achievable, Relevant, Time-bound).",
              relations: "Each objective addresses one identified problem.",
              rules: "Objectives must be verifiable through indicators.",
              score: 0
            }
          ]
        },
        {
          code: "1.2",
          title: "Target groups and needs",
          prompt: "Describe the target groups and explain why these groups need this project.",
          maxScore: 8,
          threshold: 5,
          generalRules: [
            "Target groups must be clearly defined and justified.",
            "Needs must be documented with evidence."
          ],
          scoreCaps: [
            "Maximum 8 points. Below 5 points, the section does not pass."
          ],
          miniPoints: [
            {
              title: "Clear identification of target groups",
              maxScore: 4,
              mandatory: true,
              meaning: "Target groups are clearly defined with specific characteristics.",
              structure: "Description of each target group: who they are, how many, where they are.",
              relations: "Target groups must be directly benefited by project activities.",
              rules: "Both direct and indirect beneficiaries must be included.",
              score: 0
            },
            {
              title: "Analysis of needs",
              maxScore: 4,
              mandatory: true,
              meaning: "The needs of target groups are analysed and justified.",
              structure: "Evidence of needs: surveys, statistics, previous studies.",
              relations: "Each identified need links to a project activity.",
              rules: "Needs must be current and documented.",
              score: 0
            }
          ]
        }
      ]
    },
    {
      title: "2. Quality",
      questions: [
        {
          code: "2.1",
          title: "Work plan and methodology",
          prompt: "Describe the work plan and methodology to be used to achieve the project objectives.",
          maxScore: 15,
          threshold: 9,
          generalRules: [
            "The work plan must be realistic and coherent.",
            "The methodology must be appropriate to the objectives."
          ],
          scoreCaps: [
            "Maximum 15 points. Below 9 points, the section does not pass."
          ],
          miniPoints: [
            {
              title: "Detailed and realistic work plan",
              maxScore: 5,
              mandatory: true,
              meaning: "The work plan includes all activities, timelines, and responsibilities.",
              structure: "Gantt chart or equivalent showing activities, timeline, and responsible parties.",
              relations: "Each activity contributes to at least one specific objective.",
              rules: "Activities must be achievable within the project duration.",
              score: 0
            },
            {
              title: "Appropriate methodology",
              maxScore: 5,
              mandatory: true,
              meaning: "The chosen methodology is appropriate and justified.",
              structure: "Description of methodology with justification for its selection.",
              relations: "Methodology must be adapted to target groups and context.",
              rules: "Innovative approaches will be positively valued.",
              score: 0
            },
            {
              title: "Risk management",
              maxScore: 5,
              mandatory: false,
              meaning: "The project identifies and mitigates main risks.",
              structure: "Risk matrix with identification, probability, impact, and mitigation.",
              relations: "Risks are related to project activities.",
              rules: "At least 3 risks must be identified with their mitigation measures.",
              score: 0
            }
          ]
        }
      ]
    },
    {
      title: "3. Impact",
      questions: [
        {
          code: "3.1",
          title: "Expected results and impact",
          prompt: "Describe the expected results and the impact the project will have on beneficiaries and beyond.",
          maxScore: 12,
          threshold: 7,
          generalRules: [
            "Results must be measurable and verifiable.",
            "Impact must go beyond the immediate project period."
          ],
          scoreCaps: [
            "Maximum 12 points. Below 7 points, the section does not pass."
          ],
          miniPoints: [
            {
              title: "Measurable outputs",
              maxScore: 4,
              mandatory: true,
              meaning: "The project will produce clear, measurable outputs.",
              structure: "List of outputs with quantitative indicators.",
              relations: "Each output is linked to a specific activity.",
              rules: "Indicators must be SMART.",
              score: 0
            },
            {
              title: "Impact on target groups",
              maxScore: 4,
              mandatory: true,
              meaning: "The project will have a positive impact on identified target groups.",
              structure: "Description of impact per target group with evidence.",
              relations: "Impact is directly related to identified needs.",
              rules: "Short, medium and long-term impacts should be considered.",
              score: 0
            },
            {
              title: "Sustainability and multiplier effect",
              maxScore: 4,
              mandatory: false,
              meaning: "Results will be sustained beyond the project period.",
              structure: "Sustainability plan and description of multiplier effect.",
              relations: "Sustainability linked to institutional capacities of partners.",
              rules: "At least one mechanism to ensure sustainability must be described.",
              score: 0
            }
          ]
        }
      ]
    },
    {
      title: "4. Work Plan",
      questions: [
        {
          code: "4.1",
          title: "Budget and cost-effectiveness",
          prompt: "Describe the project budget and explain how the costs are justified and proportionate to the expected results.",
          maxScore: 10,
          threshold: 6,
          generalRules: [
            "The budget must be realistic and cost-effective.",
            "All costs must be justified."
          ],
          scoreCaps: [
            "Maximum 10 points. Below 6 points, the section does not pass."
          ],
          miniPoints: [
            {
              title: "Justified budget breakdown",
              maxScore: 5,
              mandatory: true,
              meaning: "All budget lines are justified and necessary.",
              structure: "Detailed budget by activity and cost category.",
              relations: "Each cost is linked to a specific activity.",
              rules: "Costs must comply with Erasmus+ eligible cost rules.",
              score: 0
            },
            {
              title: "Cost-effectiveness",
              maxScore: 5,
              mandatory: true,
              meaning: "The project demonstrates good value for money.",
              structure: "Comparison of cost vs. expected impact.",
              relations: "Costs are proportionate to the scale of activities.",
              rules: "Cost per beneficiary should be reasonable and justified.",
              score: 0
            }
          ]
        }
      ]
    }
  ]
};

const existing = db.prepare('SELECT id FROM projects LIMIT 1').get();

if (!existing) {
  const insertProject = db.prepare(`
    INSERT INTO projects (name, project_type, working_version_name, form_name, form_version, current_json)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const result = insertProject.run(
    appData.projectMeta.projectName,
    appData.projectMeta.projectType,
    appData.projectMeta.workingVersion,
    appData.form.name,
    appData.form.version,
    JSON.stringify(appData)
  );

  console.log(`Inserted project with id: ${result.lastInsertRowid}`);

  const insertTemplate = db.prepare(`
    INSERT INTO form_templates (name, version, description, json_schema)
    VALUES (?, ?, ?, ?)
  `);

  insertTemplate.run(
    appData.form.name,
    appData.form.version,
    'KA3 Policy Support evaluation form',
    JSON.stringify(appData)
  );

  console.log('Inserted form template');
} else {
  console.log(`Project already exists with id: ${existing.id}`);
}
