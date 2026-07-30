// Path-specific events. Choosing academia, a national lab, a startup or an
// international consortium previously changed salary and nothing else; these
// gate on prerequisites.career_path so the choice has a narrative consequence.
import { EVENT_TYPE } from '../engine/events.js';
import { STAGE, PATH } from '../engine/stages.js';
import { STRESS } from '../engine/stress.js';
import { REL as RELD } from '../engine/relationships.js';

export const PATH_EVENTS = [
  {
    id: "pac_tenure_clock",
    title: "The clock and the coil",
    text: "The coil measurement takes four years and would be the best thing you ever do. Your dossier goes in at five years and eleven months. The committee counts papers, and nobody on it has ever built anything with a lead time.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.EARLY_CAREER],
    age_range: [30, 42],
    weight: 4,
    cooldown_years: 5,
    max_fires: 1,
    prerequisites: {
      career_path: PATH.ACADEMIA
    },
    choices: [
      {
        label: "Start the four-year measurement",
        stat_check: {
          stats: ["IN", "GR"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "It works in year four, six weeks before the dossier closes, and the paper is in review when the external letters go out. Two of them mention it. You will not get five uninterrupted years again.",
            stat_deltas: {
              IN: 0.8,
              GR: 0.5
            },
            stress_delta: STRESS.MAJOR_SUCCESS,
            reputation_deltas: {
              SCI: 6,
              NET: 2
            },
            relationship_deltas: {
              npc_petrov: RELD.COLLABORATED
            },
            flags_set: ["built_the_hard_thing"]
          },
          failure: {
            text: "Year three, and the coil form warps out of tolerance during the second winding. You have a technique paper and no measurement. The dossier goes in thin, and you spend a year finding out how thin.",
            stat_deltas: {
              GR: 0.8
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              SCI: -2
            },
            relationship_deltas: {},
            flags_set: ["gambled_the_clock"]
          }
        }
      },
      {
        label: "Put two students on scaling papers and leave the coil on paper",
        stat_check: {
          stats: ["SM", "CH"],
          modifier: 0.1
        },
        outcomes: {
          success: {
            text: "Five papers in four years, all of them true and none of them surprising. The dossier is exactly as thick as the guidance suggests. The drawings stay in the drawer with a date written on the folder.",
            stat_deltas: {
              SM: 0.5,
              CH: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 3
            },
            relationship_deltas: {},
            flags_set: ["played_the_clock"]
          },
          failure: {
            text: "One student stalls on the transport code for eighteen months, and the other is scooped by a group in Garching by six weeks. Two papers, not five, and the same four years gone.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: []
          }
        }
      },
      {
        label: "Give the measurement to Petrov and keep your clock clean",
        outcomes: {
          success: {
            text: "His group has the cryostat and eleven more months of slack than you do. They do it properly, you are fourth author, and the paper lands the year you go up. Your evenings come back and you notice how quiet they are.",
            stat_deltas: {
              IN: -0.3
            },
            stress_delta: STRESS.REST,
            reputation_deltas: {
              SCI: -2
            },
            relationship_deltas: {
              npc_petrov: RELD.SHARED_CREDIT
            },
            flags_set: ["gave_away_the_measurement"]
          }
        }
      }
    ]
  },
  {
    id: "pac_course_buyout",
    title: "The buyout",
    text: "Two courses a semester, and the grant will cover a release from one. The undergraduate plasma course is yours: forty-one students, and the only place in the building where anyone hears the word divertor before their fourth year.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.EARLY_CAREER, STAGE.MID_CAREER],
    age_range: [30, 50],
    weight: 3,
    cooldown_years: 3,
    max_fires: 2,
    prerequisites: {
      career_path: PATH.ACADEMIA
    },
    choices: [
      {
        label: "Teach it, and teach it properly",
        outcomes: {
          success: {
            text: "You rebuild the problem sets around public DIII-D shot data and hold office hours nobody attends until week six, when four people do. The lab loses a semester. Thursday afternoons become the part of the week you do not dread.",
            stat_deltas: {
              CH: 0.5
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: -3
            },
            relationship_deltas: {},
            flags_set: ["teaches_properly"]
          }
        }
      },
      {
        label: "Spend the buyout and put the semester in the lab",
        stat_check: {
          stats: ["SM", "GR"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "Fourteen weeks of campaign preparation you would otherwise have done at night. The run is clean and produces two papers. The course goes to a lecturer on a one-year contract who does it well enough.",
            stat_deltas: {
              SM: 0.5,
              IN: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 4
            },
            relationship_deltas: {},
            flags_set: ["bought_out"]
          },
          failure: {
            text: "The semester goes to a vacuum leak, a failed feedthrough, and the search committee. You gave up the course and got six usable weeks out of fourteen.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              SCI: -1
            },
            relationship_deltas: {},
            flags_set: ["bought_out"]
          }
        }
      },
      {
        label: "Keep the course on the books and hand the lecturing to Kaur",
        stat_check: {
          stats: ["CH"],
          modifier: 0.1
        },
        outcomes: {
          success: {
            text: "He gives twenty-two of the twenty-six sessions and your name stays on the syllabus and in the chair's teaching count. He is good at it. He also does not finish the control systems paper that year, and it was his.",
            stat_deltas: {
              CO: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {
              SCI: 2
            },
            relationship_deltas: {
              npc_kaur: RELD.IGNORED
            },
            flags_set: ["leaned_on_postdoc"]
          },
          failure: {
            text: "A student asks the chair why the person teaching the course is not the person listed. It is settled in one uncomfortable meeting and remembered considerably longer than that.",
            stat_deltas: {},
            stress_delta: STRESS.RELATIONSHIP_CONFLICT,
            reputation_deltas: {
              NET: -3
            },
            relationship_deltas: {
              npc_kaur: RELD.IGNORED
            },
            flags_set: []
          }
        }
      }
    ]
  },
  {
    id: "pac_admissions_line",
    title: "One funded line",
    text: "Forty-three applications and one guaranteed line of support. One file is a perfect transcript and a statement about wanting to work on ITER. Another has a two-year gap, no letters from anyone the committee knows, and a working Thomson scattering system built in a community college lab.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.EARLY_CAREER, STAGE.MID_CAREER],
    age_range: [32, 54],
    weight: 3,
    cooldown_years: 3,
    max_fires: 2,
    prerequisites: {
      career_path: PATH.ACADEMIA
    },
    choices: [
      {
        label: "Argue for the one who built the diagnostic",
        stat_check: {
          stats: ["CH", "IN"],
          modifier: -0.05
        },
        outcomes: {
          success: {
            text: "The committee goes along, partly to end the meeting. He is unteachable in the first year and indispensable in the third, and he rebuilds your interferometer twice.",
            stat_deltas: {
              IN: 0.5,
              CH: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: 3,
              NET: 2
            },
            relationship_deltas: {},
            flags_set: ["backed_the_outsider"]
          },
          failure: {
            text: "You lose the room and the file goes to the waitlist, where it stays. He enrolls somewhere smaller and publishes on their spherical tokamak two years later, and you read it properly, twice.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              NET: -2
            },
            relationship_deltas: {},
            flags_set: []
          }
        }
      },
      {
        label: "Take the transcript",
        outcomes: {
          success: {
            text: "She is exactly as good as the file said and never better. Five years, two papers, the first offer she gets. Nothing about the arrangement is ever difficult and nothing about it is ever interesting.",
            stat_deltas: {
              IN: -0.3,
              CH: -0.2
            },
            stress_delta: STRESS.REST,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["played_admissions_safe"]
          }
        }
      },
      {
        label: "Split the line and take both at half support",
        stat_check: {
          stats: ["GR", "CO"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "Both teach two sections a year to make up the difference. It takes each of them six years instead of five, and you get two theses out of one line and a standing with the graduate office you will need later.",
            stat_deltas: {
              GR: 0.5,
              CO: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 3,
              NET: 2
            },
            relationship_deltas: {},
            flags_set: ["split_the_line"]
          },
          failure: {
            text: "One of them leaves in year two with a master's, having spent more hours grading than on the machine. You had the conversation about workload twice, and both times you said it would ease off.",
            stat_deltas: {},
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              SCI: -2
            },
            relationship_deltas: {},
            flags_set: ["lost_a_student"]
          }
        }
      }
    ]
  },
  {
    id: "pac_closed_session",
    title: "The closed session",
    text: "Reyes goes up for tenure and the file is thin in exactly one place. She spent three years building the irradiation station that four of the department's grants now depend on, and none of the papers put her first. The chair would like a quiet vote.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.MID_CAREER],
    age_range: [38, 56],
    weight: 3,
    cooldown_years: 5,
    max_fires: 1,
    prerequisites: {
      career_path: PATH.ACADEMIA
    },
    choices: [
      {
        label: "Speak for her, at length, on the record",
        stat_check: {
          stats: ["CH", "CO"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "Eleven minutes on what a shared facility costs the person who builds it. The vote goes seven to three and the provost signs. She never mentions it to you and you never mention it to her.",
            stat_deltas: {
              CH: 0.5
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: 2,
              NET: 4
            },
            relationship_deltas: {
              npc_reyes: RELD.HELPED
            },
            flags_set: ["spoke_in_the_room"]
          },
          failure: {
            text: "It goes against her anyway, and the chair now knows exactly where you sit. Your space request the following spring is handled correctly and very slowly.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              NET: -3
            },
            relationship_deltas: {
              npc_reyes: RELD.HELPED
            },
            flags_set: ["crossed_the_chair"]
          }
        }
      },
      {
        label: "Accept the vote and spend two months landing her somewhere better",
        outcomes: {
          success: {
            text: "Nine calls, four letters, and a conversation with a lab director at a meeting you flew to for that purpose. She has an offer by March with a beamline attached. You wrote nothing of your own that winter.",
            stat_deltas: {
              CO: 0.3,
              SM: -0.2
            },
            stress_delta: STRESS.RELATIONSHIP_POSITIVE,
            reputation_deltas: {
              SCI: -3
            },
            relationship_deltas: {
              npc_reyes: RELD.HELPED
            },
            flags_set: ["found_her_a_landing"]
          }
        }
      },
      {
        label: "Vote with the chair",
        stat_check: {
          stats: ["CO"],
          modifier: 0.15
        },
        outcomes: {
          success: {
            text: "The vote is quick. In April you get the high bay, a second line for the search, and a chair who describes you in the dean's meeting as reasonable.",
            stat_deltas: {
              CO: 0.5
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {
              NET: 4,
              SCI: -2
            },
            relationship_deltas: {
              npc_reyes: RELD.IGNORED
            },
            flags_set: ["voted_with_the_chair"]
          },
          failure: {
            text: "Someone repeats the count over drinks at the March meeting. Reyes hears it from a third party inside the week, and so does everyone who has ever built a shared facility for other people to publish from.",
            stat_deltas: {},
            stress_delta: STRESS.RELATIONSHIP_CONFLICT,
            reputation_deltas: {
              NET: -4,
              SCI: -2
            },
            relationship_deltas: {
              npc_reyes: RELD.IGNORED
            },
            flags_set: ["vote_leaked"]
          }
        }
      }
    ]
  },
  {
    id: "pac_licensing_office",
    title: "The licensing office would like a word",
    text: "Three of your REBCO joint patents belong to the university, and the licensing office has found two investors who want you as founder. The dean uses the word ecosystem four times in eleven minutes. You have never wanted to run anything with a payroll.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.MID_CAREER, STAGE.SENIOR],
    age_range: [38, 60],
    weight: 2,
    cooldown_years: 5,
    max_fires: 1,
    prerequisites: {
      career_path: PATH.ACADEMIA
    },
    choices: [
      {
        label: "Found it, keep the faculty line, take the twenty percent",
        stat_check: {
          stats: ["CH", "CO"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "The company licenses the joint and funds two students under a conflict management plan with its own binder. You spend Fridays on hiring and the rest of the week roughly as before, which is more than most founders keep.",
            stat_deltas: {
              CO: 0.8,
              CH: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              NET: 6,
              PUB: 2
            },
            relationship_deltas: {
              npc_lindgren: RELD.COLLABORATED
            },
            flags_set: ["founded_reluctantly"]
          },
          failure: {
            text: "Eighteen months of board meetings, a co-founder who wants a demonstration coil before the physics is settled, and two students whose thesis chapters now sit under an NDA the university lawyer drafted. You resign the board and keep the title.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              SCI: -3,
              NET: 2
            },
            relationship_deltas: {
              npc_lindgren: RELD.DISAGREED
            },
            flags_set: ["spinout_soured"]
          }
        }
      },
      {
        label: "License it to somebody who does want to run a company",
        outcomes: {
          success: {
            text: "A magnet firm takes the licence, pays the university, and sends you a royalty statement once a year for less than a graduate stipend. They ship the joint in four years and their paper on it is careful and correct. Your Thursdays stay yours.",
            stat_deltas: {
              CO: -0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              NET: -3
            },
            relationship_deltas: {},
            flags_set: ["licensed_out"]
          }
        }
      },
      {
        label: "Publish the design in full and let anyone build it",
        stat_check: {
          stats: ["SM", "IN"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "The paper carries the tolerances, the failure modes, and the two things that took you a year to learn. Four groups build it inside eighteen months and one of them builds it better. The licensing office does not call again.",
            stat_deltas: {
              SM: 0.5,
              IN: 0.5
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: 6,
              NET: -3
            },
            relationship_deltas: {},
            flags_set: ["published_the_design", "honest_operator"]
          },
          failure: {
            text: "A company builds it, files around it, and does not cite you in the patent. The dean forwards their press release to you without comment, which is the comment.",
            stat_deltas: {
              IN: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              SCI: 2,
              NET: -4
            },
            relationship_deltas: {},
            flags_set: ["published_the_design"]
          }
        }
      }
    ]
  },
  {
    id: "pac_offer_year_four",
    title: "The offer in year four",
    text: "Agarwal has an offer from a private tokamak company: three times the stipend, a signing bonus, and a magnet programme that is already winding coils. Her thesis needs eleven more months. She told you before she told anyone.",
    type: EVENT_TYPE.RANDOM,
    stage: [STAGE.MID_CAREER, STAGE.SENIOR],
    age_range: [38, 60],
    weight: 3,
    cooldown_years: 4,
    max_fires: 2,
    prerequisites: {
      career_path: PATH.ACADEMIA
    },
    choices: [
      {
        label: "Tell her to take it and get the degree done around it",
        outcomes: {
          success: {
            text: "You restructure the thesis around what she already has, sign off on four chapters instead of six, and write the letter that week. The scaling analysis you needed for the renewal never gets done by anybody.",
            stat_deltas: {
              CH: 0.3,
              SM: -0.2
            },
            stress_delta: STRESS.RELATIONSHIP_POSITIVE,
            reputation_deltas: {
              SCI: -3
            },
            relationship_deltas: {
              npc_agarwal: RELD.HELPED
            },
            flags_set: ["let_her_go"]
          }
        }
      },
      {
        label: "Find money to close some of the gap and ask her to finish",
        stat_check: {
          stats: ["CH", "CO"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "A fellowship supplement and eleven thousand dollars out of an account that was meant for the calibration source. She stays, finishes, and the thesis is the best thing out of your group in a decade.",
            stat_deltas: {
              CO: 0.5,
              CH: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 5
            },
            relationship_deltas: {
              npc_agarwal: RELD.COLLABORATED
            },
            flags_set: ["kept_the_student"]
          },
          failure: {
            text: "The supplement takes nine weeks to approve. She accepts the offer in week six and is generous about it, which does not help.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              SCI: -2
            },
            relationship_deltas: {},
            flags_set: []
          }
        }
      },
      {
        label: "Explain what an unfinished doctorate looks like on a CV in ten years",
        stat_check: {
          stats: ["CH"],
          modifier: 0.1
        },
        outcomes: {
          success: {
            text: "She stays and she finishes, and the two papers are yours as much as hers. She defends in April, takes the job anyway, and never asks you for anything again, including a letter.",
            stat_deltas: {
              SM: 0.3,
              CH: -0.2
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {
              SCI: 4
            },
            relationship_deltas: {
              npc_agarwal: RELD.DISAGREED
            },
            flags_set: ["pressured_a_student"]
          },
          failure: {
            text: "She repeats the conversation to the other two students in the group, close to verbatim. One of them starts applying in the spring and does not tell you either.",
            stat_deltas: {},
            stress_delta: STRESS.RELATIONSHIP_CONFLICT,
            reputation_deltas: {
              NET: -3,
              SCI: -2
            },
            relationship_deltas: {
              npc_agarwal: RELD.DISAGREED
            },
            flags_set: ["pressured_a_student"]
          }
        }
      }
    ]
  },
  {
    id: "pac_service_load",
    title: "Four standing commitments",
    text: "Graduate admissions, radiation safety, the space committee, and the faculty search. All four meet Tuesdays and Thursdays, and none of them is optional in any way the chair will put in writing.",
    type: EVENT_TYPE.RANDOM,
    stage: [STAGE.EARLY_CAREER, STAGE.MID_CAREER],
    age_range: [32, 56],
    weight: 3,
    cooldown_years: 2,
    max_fires: 3,
    prerequisites: {
      career_path: PATH.ACADEMIA
    },
    choices: [
      {
        label: "Do all four properly",
        stat_check: {
          stats: ["GR", "CO"],
          modifier: -0.05
        },
        outcomes: {
          success: {
            text: "You read every file and every application. By spring you are the person the department checks with before it decides anything, which is a kind of power and costs one working day a week to hold.",
            stat_deltas: {
              CO: 0.8,
              GR: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              NET: 6
            },
            relationship_deltas: {},
            flags_set: ["does_the_service"]
          },
          failure: {
            text: "Twelve months, forty-one meetings, one paper submitted. The safety review still finds an expired seal on the neutron source, in your lab, on your watch.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              SCI: -4
            },
            relationship_deltas: {},
            flags_set: ["drowned_in_service"]
          }
        }
      },
      {
        label: "Attend, read the papers on the train, say very little",
        outcomes: {
          success: {
            text: "Nobody complains, because nobody ever does. When the annex lease comes up the decision gets made in a room you were technically in, it goes the other way, and you find out by email on a Friday.",
            stat_deltas: {
              CO: -0.3
            },
            stress_delta: STRESS.REST,
            reputation_deltas: {
              NET: -4
            },
            relationship_deltas: {},
            flags_set: ["minimum_service"]
          }
        }
      }
    ]
  },
  {
    id: "pac_funding_gap",
    title: "Three months of nothing",
    text: "The renewal decision lands three months after the current grant ends. Kaur is on a twelve-month appointment the university will not carry a day past the end date. The gap is eighty-four thousand dollars.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.EARLY_CAREER, STAGE.MID_CAREER],
    age_range: [32, 54],
    weight: 3,
    cooldown_years: 4,
    max_fires: 2,
    prerequisites: {
      career_path: PATH.ACADEMIA
    },
    choices: [
      {
        label: "Cover it from what is left of the startup package",
        outcomes: {
          success: {
            text: "The package was for the calibration source, which you now will not buy for another two years. He stays employed, the campaign keeps running, and every number you take that year carries a systematic you cannot pin down.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: -3
            },
            relationship_deltas: {
              npc_kaur: RELD.HELPED
            },
            flags_set: ["covered_the_gap"]
          }
        }
      },
      {
        label: "Get him a teaching line for two quarters",
        stat_check: {
          stats: ["CH", "CO"],
          modifier: -0.05
        },
        outcomes: {
          success: {
            text: "The chair finds a lectureship at sixty percent and the department gets a control systems course it has wanted for six years. He teaches, the lab slows, and he is still there when the renewal lands.",
            stat_deltas: {
              CH: 0.5,
              CO: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {
              NET: 3
            },
            relationship_deltas: {
              npc_kaur: RELD.COLLABORATED
            },
            flags_set: ["bridged_with_teaching"]
          },
          failure: {
            text: "There is no line and there was never going to be one. He takes a staff position at a national lab in six weeks, with a badge and a pension, and the campaign stops where it stands.",
            stat_deltas: {},
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              SCI: -4
            },
            relationship_deltas: {},
            flags_set: ["lost_the_postdoc"]
          }
        }
      },
      {
        label: "Ask the collaborating lab to carry him for a quarter",
        stat_check: {
          stats: ["CO"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "They say yes in four days, which tells you how badly they want the data. He is paid, the campaign runs, and the paper comes out with their name first, because that is what being carried costs.",
            stat_deltas: {
              CO: 0.5
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {
              NET: 4,
              SCI: -2
            },
            relationship_deltas: {
              npc_petrov: RELD.COLLABORATED
            },
            flags_set: ["borrowed_a_salary"]
          },
          failure: {
            text: "Their own budget lands badly and the answer comes back after five weeks as a no with three paragraphs of apology attached. You have spent five weeks not solving the problem.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: []
          }
        }
      }
    ]
  },
  {
    id: "pac_high_bay",
    title: "The high bay",
    text: "There is one bay in the building with a fifteen ton crane, and the dean has hired an experimentalist who needs it. Yours holds a vacuum vessel that has not taken a shot in fourteen months.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.MID_CAREER, STAGE.SENIOR],
    age_range: [42, 62],
    weight: 2,
    cooldown_years: 5,
    max_fires: 1,
    prerequisites: {
      career_path: PATH.ACADEMIA
    },
    choices: [
      {
        label: "Fight it at the executive committee",
        stat_check: {
          stats: ["CO", "CH"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "You bring the shot log, the two papers still in preparation from the last campaign, and a letter from Hartley. You keep two thirds of the floor and lose the north wall. Nobody enjoys the meeting.",
            stat_deltas: {
              CO: 0.5
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              NET: 2
            },
            relationship_deltas: {
              npc_hartley: RELD.HELPED
            },
            flags_set: ["kept_the_bay"]
          },
          failure: {
            text: "You lose the bay and the argument, and the minutes show you fighting for a vessel that had not run in over a year. The new hire is embarrassed about it, which is somehow the worst part.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              NET: -4
            },
            relationship_deltas: {},
            flags_set: ["lost_the_bay"]
          }
        }
      },
      {
        label: "Take the annex and skip the fight",
        outcomes: {
          success: {
            text: "Four months of crating, and the vessel comes back up in a leased building eleven miles off campus where nobody drops in on the way to anywhere. The students stop overlapping with anyone outside the group. The dean owes you one and says so in an email you keep.",
            stat_deltas: {
              CO: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: -3,
              NET: -2
            },
            relationship_deltas: {},
            flags_set: ["moved_to_the_annex"]
          }
        }
      },
      {
        label: "Offer to share the bay",
        stat_check: {
          stats: ["CH", "IN"],
          modifier: -0.05
        },
        outcomes: {
          success: {
            text: "A shared crane schedule, a shared roughing pump, and eventually a shared student measuring your first wall samples in their cryostat. It is the most interesting thing ever to come out of a space dispute.",
            stat_deltas: {
              CH: 0.5,
              IN: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: 3,
              NET: 3
            },
            relationship_deltas: {
              npc_reyes: RELD.COLLABORATED
            },
            flags_set: ["shared_the_bay"]
          },
          failure: {
            text: "Sharing means their equipment arrives on a schedule and yours moves when it is in the way. By the second year the bay is theirs in every sense but the floor plan, and you agreed to all of it in writing.",
            stat_deltas: {},
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              NET: -2
            },
            relationship_deltas: {},
            flags_set: ["lost_the_bay"]
          }
        }
      }
    ]
  },
  {
    id: "pac_evaluations",
    title: "The evaluations come back",
    text: "Median 3.1 out of 5 for the undergraduate plasma course, two comments about pace, and one about problem sets from a machine that was decommissioned before the students were born. The chair's annual letter mentions it twice in a page and a half.",
    type: EVENT_TYPE.RANDOM,
    stage: [STAGE.EARLY_CAREER, STAGE.MID_CAREER],
    age_range: [30, 50],
    weight: 2,
    cooldown_years: 3,
    max_fires: 2,
    prerequisites: {
      career_path: PATH.ACADEMIA
    },
    choices: [
      {
        label: "Rebuild the course over the summer",
        stat_check: {
          stats: ["GR", "CH"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "New problem sets on public shot data, a lab session on Langmuir probes, and an hour a week you did not have. The median comes back at 4.4 and eleven students ask about the group. Two of them are good.",
            stat_deltas: {
              CH: 0.5,
              GR: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              NET: 3
            },
            relationship_deltas: {},
            flags_set: ["fixed_the_course"]
          },
          failure: {
            text: "You rebuild it and the median moves to 3.3. The comments now say the pace is uneven, which is fair, because you are teaching a course you wrote six weeks ago.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: []
          }
        }
      },
      {
        label: "Give the course back to Castellanos, who has been asking",
        outcomes: {
          success: {
            text: "He taught it before you defended and would take it tomorrow. He does. His median is 4.6, the chair's next letter does not mention teaching at all, and you are no longer the reason anyone in that room hears about fusion.",
            stat_deltas: {
              CH: -0.3
            },
            stress_delta: STRESS.REST,
            reputation_deltas: {
              NET: -3
            },
            relationship_deltas: {
              npc_castellanos: RELD.CHOSE_THEM
            },
            flags_set: ["gave_up_the_course"]
          }
        }
      }
    ]
  },
  {
    id: "pac_two_finalists",
    title: "Two finalists, one line",
    text: "A computational plasma person with eleven papers in two years and a pipeline the dean can describe to a donor. An experimentalist with four papers, six years of divertor commissioning, and the ability to find a leak in an afternoon.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.MID_CAREER, STAGE.SENIOR],
    age_range: [44, 64],
    weight: 2,
    cooldown_years: 5,
    max_fires: 2,
    prerequisites: {
      career_path: PATH.ACADEMIA
    },
    choices: [
      {
        label: "Argue for the experimentalist",
        stat_check: {
          stats: ["CH", "IN"],
          modifier: -0.05
        },
        outcomes: {
          success: {
            text: "Two meetings and a written case about what the department can no longer do. She arrives in August and has the old linear device running by Christmas with three undergraduates on it.",
            stat_deltas: {
              CH: 0.5,
              IN: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: 5,
              NET: 2
            },
            relationship_deltas: {},
            flags_set: ["hired_hands"]
          },
          failure: {
            text: "The vote goes the other way, eight to two, and you are on record as the person who argued against the candidate with the citation record. The dean's office notes it and does not forget it.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              NET: -3
            },
            relationship_deltas: {},
            flags_set: []
          }
        }
      },
      {
        label: "Back the computational hire",
        outcomes: {
          success: {
            text: "Nine to one, twenty minutes, everyone pleased. He is genuinely good. The department has now not hired anyone who can align a mirror in nine years, and the teaching lab is a storeroom.",
            stat_deltas: {
              IN: -0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: -3
            },
            relationship_deltas: {},
            flags_set: ["voted_with_the_room"]
          }
        }
      },
      {
        label: "Push to fail the search and run it again",
        stat_check: {
          stats: ["CO", "GR"],
          modifier: -0.15
        },
        outcomes: {
          success: {
            text: "You hold the line through a long March and the provost lets the position roll. The second pool is stronger and you hire someone who does both. It costs the department a year and you most of your credit with the chair.",
            stat_deltas: {
              GR: 0.8,
              CO: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 4,
              NET: -2
            },
            relationship_deltas: {},
            flags_set: ["failed_the_search"]
          },
          failure: {
            text: "The provost pulls the line rather than carry it another year. The department is down a position and everyone in it can name the reason.",
            stat_deltas: {},
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              NET: -5
            },
            relationship_deltas: {},
            flags_set: ["lost_the_line"]
          }
        }
      }
    ]
  },
  {
    id: "pac_chair_offer",
    title: "They want you to chair",
    text: "Three years, one course release, and the department's entire administrative surface. The current chair is leaving eighteen months early and will not put the reason in writing.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.SENIOR],
    age_range: [50, 63],
    weight: 3,
    cooldown_years: 5,
    max_fires: 1,
    prerequisites: {
      career_path: PATH.ACADEMIA
    },
    choices: [
      {
        label: "Take it",
        stat_check: {
          stats: ["CH", "CO"],
          modifier: -0.05
        },
        outcomes: {
          success: {
            text: "You run it well and hate two days out of five. Two hires, a rebuilt teaching lab, and the graduate stipend up nine percent, which nobody outside the department will ever know was you.",
            stat_deltas: {
              CH: 0.8,
              CO: 0.8
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              NET: 7,
              SCI: -2
            },
            relationship_deltas: {},
            flags_set: ["took_the_chair"]
          },
          failure: {
            text: "Three years of grievances, one personnel matter you are not qualified to handle, and a budget worse than the outgoing chair admitted. Your lab publishes twice, both papers from work finished before you started.",
            stat_deltas: {
              GR: 0.8
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              SCI: -5,
              NET: 2
            },
            relationship_deltas: {},
            flags_set: ["chair_ground_you_down"]
          }
        }
      },
      {
        label: "Decline, and mean it",
        outcomes: {
          success: {
            text: "They ask twice more and then stop asking. Someone with less patience takes it, and the annex lease, the stipend and the search are all decided by a person whose priorities are not yours. You keep your beam time.",
            stat_deltas: {
              CO: -0.3
            },
            stress_delta: STRESS.REST,
            reputation_deltas: {
              NET: -5
            },
            relationship_deltas: {},
            flags_set: ["declined_the_chair"]
          }
        }
      },
      {
        label: "Take it on written conditions: two lines and the annex lease",
        stat_check: {
          stats: ["CO"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "The dean signs a memo with numbers in it, which almost nobody gets. You spend three years spending exactly what you were promised, and the department is measurably better at the end than at the start.",
            stat_deltas: {
              CO: 0.8,
              CH: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              NET: 8
            },
            relationship_deltas: {},
            flags_set: ["chaired_on_terms"]
          },
          failure: {
            text: "The dean declines to put anything in writing and the job goes to someone who did not ask for terms. The asking is remembered. You are not on the executive committee again for six years.",
            stat_deltas: {},
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              NET: -4
            },
            relationship_deltas: {},
            flags_set: []
          }
        }
      }
    ]
  },
  {
    id: "pac_last_syllabus",
    title: "The last syllabus",
    text: "You have taught the graduate plasma course twenty-nine times. The department would like to modernize it, has asked Agarwal to take it over, and has asked you separately whether you mind.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.SENIOR],
    age_range: [56, 65],
    weight: 2,
    cooldown_years: 5,
    max_fires: 1,
    prerequisites: {
      career_path: PATH.ACADEMIA
    },
    choices: [
      {
        label: "Hand it over and sit in the back for a term",
        outcomes: {
          success: {
            text: "She cuts the two lectures on the old confinement scalings, which you wrote, and adds a week on integrated modelling. It is a better course. You are in the room for all fourteen weeks and say nothing until a student asks you something directly.",
            stat_deltas: {
              SM: -0.2,
              CH: 0.3
            },
            stress_delta: STRESS.REST,
            reputation_deltas: {
              NET: -2
            },
            relationship_deltas: {
              npc_agarwal: RELD.CHOSE_THEM
            },
            flags_set: ["handed_over_the_course"]
          }
        }
      },
      {
        label: "Co-teach it one more year",
        stat_check: {
          stats: ["CH", "GR"],
          modifier: -0.05
        },
        outcomes: {
          success: {
            text: "Two lecturers, one course, and an argument in week nine in front of forty students about whether the old scalings are worth their hour. The students say afterwards it was the best week. You concede the point in week ten.",
            stat_deltas: {
              CH: 0.5,
              SM: 0.3
            },
            stress_delta: STRESS.MENTORING,
            reputation_deltas: {
              SCI: 2,
              NET: 3
            },
            relationship_deltas: {
              npc_agarwal: RELD.COLLABORATED
            },
            flags_set: ["cotaught_the_course"]
          },
          failure: {
            text: "Two people teaching one course is one too many, and the students work out fast which of you to ask. She defers to you in public and rebuilds the notes in private, and the year is longer than it needs to be.",
            stat_deltas: {},
            stress_delta: STRESS.RELATIONSHIP_CONFLICT,
            reputation_deltas: {
              NET: -2
            },
            relationship_deltas: {
              npc_agarwal: RELD.DISAGREED
            },
            flags_set: []
          }
        }
      },
      {
        label: "Say that you do mind",
        stat_check: {
          stats: ["CO"],
          modifier: 0.1
        },
        outcomes: {
          success: {
            text: "You keep it three more years and teach it exactly as you have. The evaluations are unchanged, which is to say fine, and the modernization happens the week after you stop.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {
              SCI: 2,
              NET: -3
            },
            relationship_deltas: {
              npc_agarwal: RELD.DISAGREED
            },
            flags_set: ["kept_the_course"]
          },
          failure: {
            text: "The chair takes it as a scheduling preference and lists Agarwal anyway. Everyone in the department now knows you objected, including her, and the course is hers regardless.",
            stat_deltas: {},
            stress_delta: STRESS.RELATIONSHIP_CONFLICT,
            reputation_deltas: {
              NET: -4
            },
            relationship_deltas: {
              npc_agarwal: RELD.DISAGREED
            },
            flags_set: []
          }
        }
      }
    ]
  },
  {
    id: "pac_consulting_day",
    title: "One day in seven",
    text: "The university permits one consulting day a week. A private tokamak company would like to buy all of them, at a rate that closes the distance between your salary and the offers your own students are turning down.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.EARLY_CAREER, STAGE.MID_CAREER],
    age_range: [33, 56],
    weight: 2,
    cooldown_years: 4,
    max_fires: 2,
    prerequisites: {
      career_path: PATH.ACADEMIA
    },
    choices: [
      {
        label: "Take the one day and file the disclosure",
        stat_check: {
          stats: ["CH", "CO"],
          modifier: -0.05
        },
        outcomes: {
          success: {
            text: "Wednesdays on their magnet programme, filed with the conflict office, and it makes you better at the day job in ways you did not expect. They fund a student the following year with no strings anyone can find.",
            stat_deltas: {
              CO: 0.5,
              IN: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              NET: 4,
              PUB: 2
            },
            relationship_deltas: {
              npc_lindgren: RELD.COLLABORATED
            },
            flags_set: ["consults_openly"]
          },
          failure: {
            text: "Your name appears in their funding announcement above the university's, before anyone shows you the copy. The conflict office is satisfied. Three colleagues are not, and one of them sits on your renewal panel.",
            stat_deltas: {},
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              NET: -3,
              SCI: -2
            },
            relationship_deltas: {},
            flags_set: ["consulting_awkward"]
          }
        }
      },
      {
        label: "Decline the whole arrangement",
        outcomes: {
          success: {
            text: "You keep the week clean and the salary you have. Two of your best people leave for that company in the next four years, and you do not have a single number from inside a commercial magnet programme to teach from.",
            stat_deltas: {
              CO: -0.3
            },
            stress_delta: STRESS.REST,
            reputation_deltas: {
              NET: -4
            },
            relationship_deltas: {},
            flags_set: ["declined_consulting"]
          }
        }
      },
      {
        label: "Take two days and report one",
        stat_check: {
          stats: ["CO"],
          modifier: 0.1
        },
        outcomes: {
          success: {
            text: "The money funds a student the department was not going to fund, and buys you coil test data nobody outside that company has seen. It is one line on one form, and you know exactly which line.",
            stat_deltas: {
              CO: 0.8,
              IN: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {
              NET: 4,
              SCI: 2
            },
            relationship_deltas: {
              npc_lindgren: RELD.COLLABORATED
            },
            flags_set: ["underreported_consulting"]
          },
          failure: {
            text: "A routine review of outside activity reports crosses their invoice records. Nothing formal follows beyond a corrected filing and one meeting with the dean, and you are on a list now.",
            stat_deltas: {},
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              NET: -5,
              SCI: -3
            },
            relationship_deltas: {},
            flags_set: ["caught_underreporting"]
          }
        }
      }
    ]
  },
  {
    id: "pnl_run_allocation_chair",
    title: "Forty two weeks, one hundred and ninety proposals",
    text: "You chair the run allocation. The committee sits for two days, the machine has forty two weeks in it, and one hundred and ninety proposals came in. Most of the field goes home with nothing whatever you do.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.MID_CAREER],
    age_range: [38, 58],
    weight: 4,
    cooldown_years: 4,
    max_fires: 2,
    prerequisites: {
      career_path: PATH.NATIONAL_LAB
    },
    choices: [
      {
        label: "Rank on merit and publish the scores",
        stat_check: {
          stats: ["SM", "CO"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "The ranked list goes out with the scores attached, which nobody here has done before. Four groups lose their year and none of them can argue with the arithmetic. Two ask for the rubric so they can write better next time.",
            stat_deltas: {
              SM: 0.3,
              CO: 0.5
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 5,
              NET: 3
            },
            relationship_deltas: {
              npc_hartley: RELD.COLLABORATED
            },
            flags_set: ["ran_open_allocation", "honest_operator"]
          },
          failure: {
            text: "The scores are defensible and the outcome is not. Three programmes that have run here for fifteen years get nothing, and one of them writes to the lab director rather than to you.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              NET: -3
            },
            relationship_deltas: {
              npc_castellanos: RELD.DISAGREED
            },
            flags_set: ["allocation_backlash"]
          }
        }
      },
      {
        label: "Reserve eight weeks for the small university groups",
        stat_check: {
          stats: ["CH", "GR"],
          modifier: -0.05
        },
        outcomes: {
          success: {
            text: "You take the eight weeks off the top before ranking anything and defend it out loud. Two of those groups produce the most cited work of the run period, on a machine they could never have built.",
            stat_deltas: {
              CH: 0.5,
              GR: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 2,
              NET: 5
            },
            relationship_deltas: {
              npc_kaur: RELD.HELPED
            },
            flags_set: ["protected_small_users"]
          },
          failure: {
            text: "The large collaborations read it as taxing them to fund sentiment, and say so at the users meeting in front of two hundred people. The eight weeks stay. So does the phrase.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              NET: -4
            },
            relationship_deltas: {
              npc_dubois: RELD.DISAGREED
            },
            flags_set: []
          }
        }
      },
      {
        label: "Hand the gavel to Reyes and take a slot like everybody else",
        outcomes: {
          success: {
            text: "Reyes chairs it competently and you spend those two days on your own analysis. The schedule that comes out is fair, and every group that got shorted knows exactly who to thank, and it is not you, which cuts both ways.",
            stat_deltas: {
              CO: -0.3
            },
            stress_delta: STRESS.REST,
            reputation_deltas: {
              NET: -4
            },
            relationship_deltas: {
              npc_reyes: RELD.HELPED
            },
            flags_set: ["declined_the_gavel"]
          }
        }
      }
    ]
  },
  {
    id: "pnl_foreign_national_access",
    title: "Fourteen weeks and counting",
    text: "Kaur's postdoc has waited fourteen weeks for foreign national access. Counter intelligence says twelve to sixteen more, without apology, because it is not their schedule that slips. The campaign runs in six.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.EARLY_CAREER, STAGE.MID_CAREER],
    age_range: [29, 50],
    weight: 3,
    cooldown_years: 3,
    max_fires: 2,
    prerequisites: {
      career_path: PATH.NATIONAL_LAB
    },
    choices: [
      {
        label: "Escalate it to the director's office",
        stat_check: {
          stats: ["CH", "CO"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "Somebody makes a call and the approval arrives in eleven days, with no explanation of why fourteen weeks was necessary and eleven days was possible.",
            stat_deltas: {
              CH: 0.3,
              CO: 0.5
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              NET: 3
            },
            relationship_deltas: {
              npc_kaur: RELD.HELPED
            },
            flags_set: ["escalated_clearance"]
          },
          failure: {
            text: "The office declines to intervene in a process it does not own. Your file now shows a request that reads as pressure, and the next one you send takes longer, not shorter.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              NET: -2
            },
            relationship_deltas: {
              npc_kaur: RELD.DISAGREED
            },
            flags_set: []
          }
        }
      },
      {
        label: "Rebuild her project around data she can touch without a badge",
        stat_check: {
          stats: ["SM", "IN"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "She never sets foot on the floor and produces the best transport analysis of the campaign out of shot files and a laptop. Her name goes first on it. She still has not seen the machine.",
            stat_deltas: {
              SM: 0.5,
              IN: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 4
            },
            relationship_deltas: {
              npc_kaur: RELD.COLLABORATED
            },
            flags_set: ["worked_around_clearance"]
          },
          failure: {
            text: "The analysis only version of the project is thin and she knows it before you do. She finishes the year, publishes something respectable, and takes a position in Ontario where the badge takes a fortnight.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {
              npc_kaur: RELD.IGNORED
            },
            flags_set: ["lost_a_postdoc"]
          }
        }
      },
      {
        label: "Move her onto something that needs no badge",
        outcomes: {
          success: {
            text: "You put her on a bench project that needs no access request and no vessel. It is honest work and it is not what she came four thousand miles for. The approval letter arrives the week her contract ends.",
            stat_deltas: {
              CH: -0.2
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: -3
            },
            relationship_deltas: {
              npc_kaur: RELD.IGNORED
            },
            flags_set: ["clearance_ate_the_year"]
          }
        }
      }
    ]
  },
  {
    id: "pnl_house_mark_zero",
    title: "The House mark",
    text: "The House mark zeroes your programme line. The Senate mark keeps it whole. Between here and conference there are eleven weeks, four people who matter, and one hundred and forty staff who have already read the news.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.MID_CAREER, STAGE.SENIOR],
    age_range: [40, 64],
    weight: 4,
    cooldown_years: 5,
    max_fires: 2,
    prerequisites: {
      career_path: PATH.NATIONAL_LAB
    },
    choices: [
      {
        label: "Work the delegation from the district",
        stat_check: {
          stats: ["CO", "CH"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "Two members whose districts hold the payroll take an interest. The line comes out of conference at eighty two percent, which everybody in the building agrees to call a win.",
            stat_deltas: {
              CO: 0.8,
              CH: 0.3
            },
            stress_delta: STRESS.MAJOR_SUCCESS,
            reputation_deltas: {
              NET: 6,
              PUB: 2
            },
            relationship_deltas: {
              npc_hartley: RELD.COLLABORATED
            },
            flags_set: ["saved_the_line"]
          },
          failure: {
            text: "Eleven weeks in rooms where physics is not the currency, and the line comes out at zero anyway. The machine goes to standby in October and fourteen people take a reduction in force.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              NET: -2
            },
            relationship_deltas: {},
            flags_set: ["programme_zeroed"]
          }
        }
      },
      {
        label: "Send the programme office the physics case and let them carry it",
        stat_check: {
          stats: ["SM", "IN"],
          modifier: -0.05
        },
        outcomes: {
          success: {
            text: "The case is good enough that the programme manager puts your figure in her own briefing, unedited. The line survives at sixty percent and nobody outside the building knows your name was on it.",
            stat_deltas: {
              SM: 0.5
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 5
            },
            relationship_deltas: {
              npc_hartley: RELD.SHARED_CREDIT
            },
            flags_set: ["let_the_science_argue"]
          },
          failure: {
            text: "The physics case is unanswerable and it does not answer the question being asked, which is about a district. The line survives at thirty percent, which is a slower version of zero.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              SCI: 2,
              NET: -2
            },
            relationship_deltas: {},
            flags_set: []
          }
        }
      },
      {
        label: "Start writing the shutdown plan now",
        outcomes: {
          success: {
            text: "You cost out standby, the argon backfill, the severance, and the order in which the groups get told. The line survives at forty percent and the plan goes in a drawer, and everyone in the building knows who wrote it.",
            stat_deltas: {
              CH: -0.2
            },
            stress_delta: STRESS.REST,
            reputation_deltas: {
              NET: -3,
              PUB: -2
            },
            relationship_deltas: {},
            flags_set: ["wrote_the_shutdown_plan"]
          }
        }
      }
    ]
  },
  {
    id: "pnl_user_blames_diagnostic",
    title: "Four of five days",
    text: "A visiting group lost four of their five days to a Thomson scattering laser that would not hold alignment. Castellanos wants it in writing that the fault was the facility's.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.EARLY_CAREER, STAGE.MID_CAREER],
    age_range: [29, 52],
    weight: 3,
    cooldown_years: 2,
    max_fires: 2,
    prerequisites: {
      career_path: PATH.NATIONAL_LAB
    },
    choices: [
      {
        label: "Pull the logbook and go through it with him",
        stat_check: {
          stats: ["SM"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "The alignment drifted every time their own gas puff fired, and it is in the log four times before anyone looked. He reads it, says nothing for a while, and asks for the puff timing instead of the memo.",
            stat_deltas: {
              SM: 0.5
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {
              SCI: 2
            },
            relationship_deltas: {
              npc_castellanos: RELD.COLLABORATED
            },
            flags_set: []
          },
          failure: {
            text: "The log shows the laser table was last surveyed nine months ago against a six month interval. The fault is the facility's in ink, and you write the memo he asked for and sign it.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              SCI: -3
            },
            relationship_deltas: {
              npc_castellanos: RELD.DISAGREED
            },
            flags_set: ["facility_fault_on_record"]
          }
        }
      },
      {
        label: "Rebuild the table before the next user block",
        stat_check: {
          stats: ["GR", "IN"],
          modifier: -0.05
        },
        outcomes: {
          success: {
            text: "Six weeks of nights and a new kinematic mount. The laser holds alignment for three run periods, and nobody ever thanks anyone for a diagnostic that works.",
            stat_deltas: {
              GR: 0.5,
              IN: 0.5
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 4,
              NET: 3
            },
            relationship_deltas: {
              npc_haddad: RELD.COLLABORATED
            },
            flags_set: ["fixed_the_diagnostic"]
          },
          failure: {
            text: "You take the table apart and the replacement optics have a twenty week lead time. The machine runs a whole period without Thomson, and every group that year works around a missing channel.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              SCI: -2,
              NET: -3
            },
            relationship_deltas: {},
            flags_set: ["diagnostic_down_a_period"]
          }
        }
      },
      {
        label: "Give them a week out of your own allocation",
        outcomes: {
          success: {
            text: "Five days out of your group's block, and the memo becomes unnecessary. Your students lose the density scan they had planned for eighteen months. Castellanos tells the next users meeting that the facility looked after them.",
            stat_deltas: {
              IN: -0.2
            },
            stress_delta: STRESS.RELATIONSHIP_POSITIVE,
            reputation_deltas: {
              SCI: -3
            },
            relationship_deltas: {
              npc_castellanos: RELD.HELPED
            },
            flags_set: ["paid_the_user_back"]
          }
        }
      }
    ]
  },
  {
    id: "pnl_upgrade_project_office",
    title: "Eight years",
    text: "New divertor, new power supplies, a building. Eight years from CD-1 to first plasma if nothing goes wrong, and they want you to run the project office. Eight years of earned value reports and none of your own data.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.MID_CAREER],
    age_range: [38, 56],
    weight: 4,
    cooldown_years: 5,
    max_fires: 1,
    prerequisites: {
      career_path: PATH.NATIONAL_LAB
    },
    choices: [
      {
        label: "Take the project",
        stat_check: {
          stats: ["GR", "CO"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "You deliver it eleven months late and four percent over, which in project language is on schedule and on budget. It will run for twenty five years. Your last first author paper is eight years old and you have stopped counting.",
            stat_deltas: {
              GR: 0.8,
              CO: 0.8
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              NET: 8,
              SCI: 2
            },
            relationship_deltas: {
              npc_petrov: RELD.COLLABORATED
            },
            flags_set: ["ran_the_upgrade"]
          },
          failure: {
            text: "The baseline slips twice, the divertor vendor misses two milestones, and an independent review recommends rebaselining, which is the polite form of the question about you. The machine gets built. Somebody else cuts the ribbon.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              NET: 2,
              SCI: -2
            },
            relationship_deltas: {
              npc_petrov: RELD.DISAGREED
            },
            flags_set: ["upgrade_rebaselined"]
          }
        }
      },
      {
        label: "Take it as deputy and keep one run week a year",
        stat_check: {
          stats: ["CH", "GR"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "Oyelaran takes the front of the room and you take the schedule, and for one week every January you are a physicist again. It is not enough physics and it is not nothing.",
            stat_deltas: {
              CH: 0.5,
              GR: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              NET: 4,
              SCI: 2
            },
            relationship_deltas: {
              npc_oyelaran: RELD.COLLABORATED
            },
            flags_set: ["deputy_on_the_upgrade"]
          },
          failure: {
            text: "You do two jobs at about seventy percent each. The run week is given away twice, and the project staff quietly learn to route around the person who is sometimes in the control room.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              NET: -2
            },
            relationship_deltas: {
              npc_oyelaran: RELD.DISAGREED
            },
            flags_set: []
          }
        }
      },
      {
        label: "Let Oyelaran have it",
        outcomes: {
          success: {
            text: "She runs it and you keep your run weeks. For eight years you do the physics you wanted on a machine being rebuilt around you, and every decision about your diagnostic ports is made in a meeting you are not in.",
            stat_deltas: {
              CO: -0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              NET: -5
            },
            relationship_deltas: {
              npc_oyelaran: RELD.CHOSE_THEM
            },
            flags_set: ["stayed_off_the_project"]
          }
        }
      }
    ]
  },
  {
    id: "pnl_work_permit_expired",
    title: "The permit expired at midnight",
    text: "Two in the morning, the vessel is open, the crew is gowned, and the work permit expired at midnight. The safety officer who can sign a new one lives forty minutes out and is asleep.",
    type: EVENT_TYPE.RANDOM,
    stage: [STAGE.EARLY_CAREER, STAGE.MID_CAREER],
    age_range: [28, 50],
    weight: 3,
    cooldown_years: 2,
    max_fires: 3,
    prerequisites: {
      career_path: PATH.NATIONAL_LAB
    },
    choices: [
      {
        label: "Call her",
        stat_check: {
          stats: ["CH"],
          modifier: 0.1
        },
        outcomes: {
          success: {
            text: "She drives in, reads the job, signs at ten past three and drinks the worst coffee in the building. The entry happens with three hours of window still in it.",
            stat_deltas: {
              CH: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {
              NET: 2
            },
            relationship_deltas: {
              npc_varga: RELD.COLLABORATED
            },
            flags_set: []
          },
          failure: {
            text: "She will not sign a permit at two in the morning for a job she has not walked, which is the correct answer and not the one you wanted. The entry waits for nine o'clock and the conditioning is gone with it.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              SCI: -2
            },
            relationship_deltas: {
              npc_varga: RELD.DISAGREED
            },
            flags_set: []
          }
        }
      },
      {
        label: "Go in on the expired permit and square it at nine",
        stat_check: {
          stats: ["IN", "GR"],
          modifier: -0.05
        },
        outcomes: {
          success: {
            text: "Forty minutes inside, alignment done, vessel closed by five. The permit is reissued in the morning with the times written the way they need to be written, and the campaign keeps its window.",
            stat_deltas: {
              IN: 0.5
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {
              SCI: 3
            },
            relationship_deltas: {},
            flags_set: ["worked_off_permit"]
          },
          failure: {
            text: "An assessor pulls the entry log against the permit timestamps six weeks later. Stop work on your group for eleven days, a causal analysis, and your name in a document read by people who have never met you.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              SCI: -3,
              NET: -4
            },
            relationship_deltas: {
              npc_varga: RELD.DISAGREED
            },
            flags_set: ["stop_work_order"]
          }
        }
      },
      {
        label: "Stand the crew down",
        outcomes: {
          success: {
            text: "You send six people home at two in the morning and lose the conditioning with them. Nobody argues. The permit is signed at nine, you start again on Thursday, and the run plan is a week shorter than it was.",
            stat_deltas: {
              IN: -0.2
            },
            stress_delta: STRESS.REST,
            reputation_deltas: {
              SCI: -2
            },
            relationship_deltas: {},
            flags_set: ["stood_the_crew_down"]
          }
        }
      }
    ]
  },
  {
    id: "pnl_near_miss",
    title: "Nobody was under it",
    text: "A five tonne coil frame swung a metre wide of where the rigging plan put it. Nobody was under it. Nobody outside the four people on the floor knows anything happened.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.EARLY_CAREER, STAGE.MID_CAREER],
    age_range: [30, 55],
    weight: 3,
    cooldown_years: 3,
    max_fires: 2,
    prerequisites: {
      career_path: PATH.NATIONAL_LAB
    },
    choices: [
      {
        label: "File it",
        stat_check: {
          stats: ["CH", "CO"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "The causal analysis finds the same lifting point mislabelled on three other fixtures in the hall, and they are corrected inside a month. Your group is named in the safety bulletin, which is credit and a mark in the same sentence.",
            stat_deltas: {
              CH: 0.3,
              CO: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              NET: 4
            },
            relationship_deltas: {
              npc_okafor: RELD.COLLABORATED
            },
            flags_set: ["reported_near_miss", "honest_operator"]
          },
          failure: {
            text: "The investigation takes eleven weeks and freezes every lift in the hall while it runs. Two hundred users learn your name attached to the reason their install slipped, which is not how you wanted them to learn it.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              NET: -3
            },
            relationship_deltas: {},
            flags_set: ["reported_near_miss", "honest_operator"]
          }
        }
      },
      {
        label: "Correct the lifting point quietly and keep the schedule",
        stat_check: {
          stats: ["IN"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "You fix the label yourself, check the three fixtures like it, and the install lands on the day it was promised. Nothing is written down and nothing happens, and both of those stay true.",
            stat_deltas: {
              IN: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {
              SCI: 2
            },
            relationship_deltas: {},
            flags_set: ["unreported_near_miss"]
          },
          failure: {
            text: "Eight months on, an assessor pulls the crane logs for an unrelated audit and asks why one lift deviated a metre from plan. There is no report to point at, and that absence is the finding.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              NET: -5
            },
            relationship_deltas: {
              npc_okafor: RELD.DISAGREED
            },
            flags_set: ["unreported_near_miss", "caught_stretching"]
          }
        }
      },
      {
        label: "Walk it up to Okafor and let her decide",
        outcomes: {
          success: {
            text: "She files it within the hour, correctly, and adds a line that the deviation was reported through her. The record shows you told a division leader rather than the system, and that distinction outlives everyone who remembers the lift.",
            stat_deltas: {
              GR: -0.2
            },
            stress_delta: STRESS.RELATIONSHIP_POSITIVE,
            reputation_deltas: {
              NET: -3
            },
            relationship_deltas: {
              npc_okafor: RELD.COLLABORATED
            },
            flags_set: ["handed_it_up"]
          }
        }
      }
    ]
  },
  {
    id: "pnl_export_control_source_term",
    title: "Seven months for a source term",
    text: "Iwasaki wants the neutronics source term for a joint paper. It is unclassified. It is also on a control list, and the licence takes seven months, by which time the result belongs to somebody in Hefei.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.MID_CAREER, STAGE.SENIOR],
    age_range: [36, 62],
    weight: 3,
    cooldown_years: 3,
    max_fires: 2,
    prerequisites: {
      career_path: PATH.NATIONAL_LAB
    },
    choices: [
      {
        label: "Start the licence and ask him to wait",
        stat_check: {
          stats: ["GR", "CO"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "Five months, not seven. He waited without complaining once, and the joint paper is better for the delay, which you would not have believed in March.",
            stat_deltas: {
              GR: 0.5,
              CO: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 4,
              NET: 3
            },
            relationship_deltas: {
              npc_iwasaki: RELD.COLLABORATED
            },
            flags_set: ["did_it_by_the_book"]
          },
          failure: {
            text: "Seven months and a denial with no reasoning attached, because none is owed. The joint paper never happens, and the result is published by two other groups inside the interval.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              SCI: -2
            },
            relationship_deltas: {
              npc_iwasaki: RELD.DISAGREED
            },
            flags_set: ["licence_denied"]
          }
        }
      },
      {
        label: "Send a derived quantity that is not itself on the list",
        stat_check: {
          stats: ["SM", "IN"],
          modifier: -0.05
        },
        outcomes: {
          success: {
            text: "You give him a normalised profile that carries the physics and not the number. The paper goes out in June, technically compliant, and you reread the regulation twice more than you needed to.",
            stat_deltas: {
              SM: 0.5
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 5
            },
            relationship_deltas: {
              npc_iwasaki: RELD.COLLABORATED
            },
            flags_set: ["worked_the_grey_area"]
          },
          failure: {
            text: "The export control officer reads the published paper and reconstructs what you sent in about ten minutes. A formal inquiry, no charge, and a year of knowing your email is read by somebody.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              SCI: -4,
              NET: -3
            },
            relationship_deltas: {},
            flags_set: ["export_inquiry"]
          }
        }
      },
      {
        label: "Tell him no, in one paragraph, and say why",
        outcomes: {
          success: {
            text: "You do not hedge it and you do not offer a workaround. He replies that he understands, publishes eighteen months later with a source term out of Karlsruhe, and never asks you for anything again.",
            stat_deltas: {
              CH: -0.2
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              NET: -4
            },
            relationship_deltas: {
              npc_iwasaki: RELD.DISAGREED
            },
            flags_set: ["said_no_cleanly"]
          }
        }
      }
    ]
  },
  {
    id: "pnl_appropriations_lapse",
    title: "Carryover",
    text: "The appropriation lapses at midnight. There is carryover for nine working days, which keeps the cryoplant cold and nothing else. Two hundred users have flights booked.",
    type: EVENT_TYPE.RANDOM,
    stage: [STAGE.MID_CAREER, STAGE.SENIOR],
    age_range: [38, 64],
    weight: 3,
    cooldown_years: 3,
    max_fires: 3,
    prerequisites: {
      career_path: PATH.NATIONAL_LAB
    },
    choices: [
      {
        label: "Burn the carryover keeping it cold",
        stat_check: {
          stats: ["CO", "GR"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "It reopens on day seven. You lose four run days, the plant never goes above twenty kelvin, and the March block runs exactly as scheduled.",
            stat_deltas: {
              CO: 0.5,
              GR: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              NET: 4,
              SCI: 2
            },
            relationship_deltas: {},
            flags_set: ["held_the_plant"]
          },
          failure: {
            text: "It runs twenty four days. The plant comes up warm on day ten, and reconditioning the vessel afterwards takes six weeks that were in nobody's budget.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              SCI: -3,
              NET: -2
            },
            relationship_deltas: {},
            flags_set: ["lost_the_plant"]
          }
        }
      },
      {
        label: "Warm it up on the first morning",
        outcomes: {
          success: {
            text: "You warm the plant on day one and give everyone a date in March. It costs the run period and it costs nobody their overtime, and you sleep properly for the first time since August.",
            stat_deltas: {
              IN: -0.2
            },
            stress_delta: STRESS.REST,
            reputation_deltas: {
              SCI: -3
            },
            relationship_deltas: {},
            flags_set: ["warm_shutdown"]
          }
        }
      }
    ]
  },
  {
    id: "pnl_staffer_tour",
    title: "Ninety minutes on a Tuesday",
    text: "Four staffers from the appropriations subcommittee, ninety minutes, and a control room that on the day will be doing vacuum work. The communications office has written a script and would like you to use it.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.MID_CAREER, STAGE.SENIOR],
    age_range: [40, 64],
    weight: 3,
    cooldown_years: 4,
    max_fires: 2,
    prerequisites: {
      career_path: PATH.NATIONAL_LAB
    },
    choices: [
      {
        label: "Take them into the shutdown, scaffolding and all",
        stat_check: {
          stats: ["CH", "IN"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "You walk them under an open vessel and let a technician explain a tile. One staffer asks a real question about the divertor, gets a real answer, and repeats it back accurately in a hearing in April.",
            stat_deltas: {
              CH: 0.5,
              IN: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              PUB: 5,
              NET: 4
            },
            relationship_deltas: {},
            flags_set: ["showed_them_the_machine"]
          },
          failure: {
            text: "They see scaffolding, a warm vessel, and eleven people doing paperwork. The word idle turns up in a subcommittee report six weeks later, without context and without malice, and does the damage anyway.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              PUB: -3
            },
            relationship_deltas: {},
            flags_set: []
          }
        }
      },
      {
        label: "Put an archive shot on the wall display and run the script",
        stat_check: {
          stats: ["CH"],
          modifier: 0.1
        },
        outcomes: {
          success: {
            text: "The control room looks like the control room they came to see. Nobody asks what the timestamp was, the line gets a plus up in the mark, and you know exactly which forty seconds did it.",
            stat_deltas: {
              CH: 0.5,
              CO: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {
              PUB: 6,
              NET: 3,
              SCI: -2
            },
            relationship_deltas: {},
            flags_set: ["staged_the_tour"]
          },
          failure: {
            text: "One of them read physics before the Hill and asks, pleasantly, what date that shot is from. The answer takes four seconds and the ninety minutes never recover.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              PUB: -5,
              NET: -3
            },
            relationship_deltas: {},
            flags_set: ["caught_staging"]
          }
        }
      },
      {
        label: "Give it to communications and go to your meeting",
        outcomes: {
          success: {
            text: "They run it cleanly and nobody technical speaks all morning. The staffers leave with a folder and no memory of a person, and a folder is what the subcommittee has when the mark gets written.",
            stat_deltas: {
              CH: -0.2
            },
            stress_delta: STRESS.REST,
            reputation_deltas: {
              PUB: -4,
              NET: -2
            },
            relationship_deltas: {},
            flags_set: ["skipped_the_tour"]
          }
        }
      }
    ]
  },
  {
    id: "pnl_midplane_port",
    title: "One midplane port",
    text: "One midplane port, three claims on it. Zhou wants a fast camera, a university consortium has already funded a spectrometer for it, and the facility's own interferometer has been on the drawing for four years.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.EARLY_CAREER, STAGE.MID_CAREER],
    age_range: [30, 54],
    weight: 3,
    cooldown_years: 3,
    max_fires: 2,
    prerequisites: {
      career_path: PATH.NATIONAL_LAB
    },
    choices: [
      {
        label: "Engineer an insert so two of them fit",
        stat_check: {
          stats: ["SM", "IN"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "Six months of design and three hundred and forty thousand dollars for a shared insert, and both instruments see the plasma with the vignetting inside specification. Four people know how close it was.",
            stat_deltas: {
              SM: 0.5,
              IN: 0.5
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 4,
              NET: 4
            },
            relationship_deltas: {
              npc_zhou: RELD.COLLABORATED
            },
            flags_set: ["engineered_the_compromise"]
          },
          failure: {
            text: "The shared insert vignettes both views at the edge, which is precisely where the physics is. Two groups get seventy percent of an instrument, and neither of them thanks you for it.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              SCI: -2,
              NET: -2
            },
            relationship_deltas: {
              npc_zhou: RELD.DISAGREED
            },
            flags_set: []
          }
        }
      },
      {
        label: "Take it for the facility interferometer",
        stat_check: {
          stats: ["CO", "GR"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "Every shot for the next decade is fit with a density channel that works, which improves everybody's analysis including the people who wanted the port. Two of them notice, and one of them says so.",
            stat_deltas: {
              CO: 0.5
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {
              SCI: 5,
              NET: -2
            },
            relationship_deltas: {
              npc_zhou: RELD.COMPETED_WON
            },
            flags_set: ["facility_first"]
          },
          failure: {
            text: "The users committee escalates it as the facility taking port real estate from the science it exists to serve, which is a sentence you cannot answer in the room. The interferometer goes in. So does the sentence, into the minutes.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              NET: -5
            },
            relationship_deltas: {
              npc_zhou: RELD.COMPETED_WON
            },
            flags_set: ["users_committee_grievance"]
          }
        }
      },
      {
        label: "Give it to the consortium",
        outcomes: {
          success: {
            text: "The spectrometer goes in and produces good data for a decade with your facility in the acknowledgements. The interferometer stays on the drawing, and every shot for ten years is fit with a channel missing.",
            stat_deltas: {
              IN: -0.2
            },
            stress_delta: STRESS.RELATIONSHIP_POSITIVE,
            reputation_deltas: {
              SCI: -3
            },
            relationship_deltas: {
              npc_zhou: RELD.IGNORED
            },
            flags_set: ["gave_the_port_away"]
          }
        }
      }
    ]
  },
  {
    id: "pnl_user_preprint",
    title: "Eleven days after their block",
    text: "A visiting group posts a preprint eleven days after their run block, on your machine, with your calibration, worked up by a control room team that ran three night shifts for them. The facility is thanked in the acknowledgements.",
    type: EVENT_TYPE.RANDOM,
    stage: [STAGE.MID_CAREER, STAGE.SENIOR],
    age_range: [36, 60],
    weight: 2,
    cooldown_years: 3,
    max_fires: 2,
    prerequisites: {
      career_path: PATH.NATIONAL_LAB
    },
    choices: [
      {
        label: "Ask them to add the operations team",
        stat_check: {
          stats: ["CH"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "Two names go on before submission and the corresponding author apologises properly, in person, at the next users meeting. The team pretend not to care, and each of them checks the listing.",
            stat_deltas: {
              CH: 0.5
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {
              NET: 4
            },
            relationship_deltas: {
              npc_reyes: RELD.HELPED
            },
            flags_set: ["got_the_team_credited"]
          },
          failure: {
            text: "They decline, citing an authorship policy that is genuinely theirs and genuinely reasonable. You are now the facility asking a user for credit, and that story travels further than the paper does.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              NET: -4
            },
            relationship_deltas: {
              npc_castellanos: RELD.DISAGREED
            },
            flags_set: []
          }
        }
      },
      {
        label: "Rewrite the user agreement instead",
        outcomes: {
          success: {
            text: "You let the preprint stand and spend the winter on the authorship clause, which is slower than an argument and holds for twenty years. The three people who worked those nights are not on any paper and never will be.",
            stat_deltas: {
              CH: -0.2
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: -2
            },
            relationship_deltas: {
              npc_reyes: RELD.IGNORED
            },
            flags_set: ["fixed_the_agreement"]
          }
        }
      }
    ]
  },
  {
    id: "pnl_retention_offer",
    title: "What would it take",
    text: "A compact tokamak company offers you 2.2 times your salary and a title with the word chief in it. The lab cannot match the number and everyone in the conversation knows it. Okafor asks what it would take to keep you.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.EARLY_CAREER, STAGE.MID_CAREER],
    age_range: [31, 52],
    weight: 3,
    cooldown_years: 4,
    max_fires: 2,
    prerequisites: {
      career_path: PATH.NATIONAL_LAB
    },
    choices: [
      {
        label: "Ask for guaranteed run weeks, in writing",
        stat_check: {
          stats: ["CH", "CO"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "Three weeks a year written into your appointment for five years, which is worth more than the salary difference and costs the lab nothing that shows on a spreadsheet. The scheduling committee finds out in November and is not delighted.",
            stat_deltas: {
              CH: 0.5,
              CO: 0.5
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: 4,
              NET: 2
            },
            relationship_deltas: {
              npc_okafor: RELD.COLLABORATED
            },
            flags_set: ["bought_run_time"]
          },
          failure: {
            text: "She cannot promise the schedule because the schedule is not hers, and you both sit with that for a moment. You stay anyway, and having asked is now a fact in the room.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              NET: -2
            },
            relationship_deltas: {
              npc_okafor: RELD.DISAGREED
            },
            flags_set: []
          }
        }
      },
      {
        label: "Ask for the deputy division post",
        stat_check: {
          stats: ["CO"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "The title, a six percent retention allowance, and a say in three hires a year. Two people who have been here longer than you read the announcement and adjust what they tell you.",
            stat_deltas: {
              CO: 0.8,
              CH: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              NET: 6
            },
            relationship_deltas: {
              npc_okafor: RELD.COLLABORATED,
              npc_reyes: RELD.COMPETED_WON
            },
            flags_set: ["took_the_deputy_post"]
          },
          failure: {
            text: "Human resources classifies it as a lateral reassignment with no allowance attached. You do the deputy's work for two years without the deputy's title, which happens here often enough to have a name.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              NET: 2
            },
            relationship_deltas: {},
            flags_set: ["acting_deputy"]
          }
        }
      },
      {
        label: "Turn it down without ever mentioning it",
        outcomes: {
          success: {
            text: "Using an offer felt like putting a knife on the table, so you decline it in an email nobody at the lab will ever see. Nothing about your appointment changes. The colleague who did use theirs is a deputy division leader inside a year.",
            stat_deltas: {
              CO: -0.3
            },
            stress_delta: STRESS.REST,
            reputation_deltas: {
              NET: -3
            },
            relationship_deltas: {},
            flags_set: ["never_used_the_offer"]
          }
        }
      }
    ]
  },
  {
    id: "pnl_decommissioning",
    title: "March",
    text: "The machine you have run for twenty two years goes to decontamination and decommissioning in March. There is a line in the budget for taking it out and a much smaller line for whatever gets kept.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.SENIOR],
    age_range: [56, 65],
    weight: 3,
    cooldown_years: 5,
    max_fires: 1,
    prerequisites: {
      career_path: PATH.NATIONAL_LAB
    },
    choices: [
      {
        label: "Fight for a two year extension",
        stat_check: {
          stats: ["CO", "CH"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "Two more years and forty more run weeks, funded out of somebody else's slip. The last campaign is the best one the machine ever ran, which is either fitting or a coincidence.",
            stat_deltas: {
              CO: 0.5,
              GR: 0.3
            },
            stress_delta: STRESS.MAJOR_SUCCESS,
            reputation_deltas: {
              SCI: 5,
              NET: 4
            },
            relationship_deltas: {
              npc_hartley: RELD.COLLABORATED
            },
            flags_set: ["won_the_extension"]
          },
          failure: {
            text: "The answer is no, and the four months you spent asking pushed the removal crew's schedule. Work starts in June with your group still packing offices around it.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              NET: -3
            },
            relationship_deltas: {},
            flags_set: ["lost_the_extension"]
          }
        }
      },
      {
        label: "Keep the control room intact",
        stat_check: {
          stats: ["CH"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "The consoles stay, the logbooks stay on the shelf, and school groups sit in the chairs. Twelve thousand visitors a year, and a fraction of one of them ends up in the field because of it.",
            stat_deltas: {
              CH: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              PUB: 6,
              NET: 2
            },
            relationship_deltas: {},
            flags_set: ["kept_the_control_room"]
          },
          failure: {
            text: "The room survives three years and then the building needs the floor space. The consoles go to a warehouse, the logbooks go somewhere nobody records, and what is left is a photograph.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              PUB: -2
            },
            relationship_deltas: {},
            flags_set: []
          }
        }
      },
      {
        label: "Spend it on the archive",
        outcomes: {
          success: {
            text: "Forty years of shot data, calibrations and handwritten logbooks migrated into formats that will still open in 2090. The vessel goes into a container in Nevada. Two people you will never meet build careers out of that archive, and there is nothing in the lobby to point at.",
            stat_deltas: {
              CH: -0.2
            },
            stress_delta: STRESS.REST,
            reputation_deltas: {
              PUB: -4,
              NET: -2
            },
            relationship_deltas: {},
            flags_set: ["saved_the_archive"]
          }
        }
      }
    ]
  },
  {
    id: "psu_milestone_tranche",
    title: "What counts as first plasma",
    text: "The Series B releases in tranches and the next one turns on two words: first plasma, by the end of Q3. You could get a breakdown discharge in a half-clean vessel in September. Nobody wrote down what breakdown means.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.EARLY_CAREER, STAGE.MID_CAREER],
    age_range: [30, 52],
    weight: 4,
    cooldown_years: 4,
    max_fires: 2,
    prerequisites: {
      career_path: PATH.STARTUP
    },
    choices: [
      {
        label: "Call the September discharge first plasma",
        stat_check: {
          stats: ["CH", "CO"],
          modifier: 0.1
        },
        outcomes: {
          success: {
            text: "The tranche releases on a 40 kiloamp discharge that lasts nine milliseconds and heats nothing. It is a plasma by any definition you are willing to defend out loud, and it is twenty-two more months of payroll.",
            stat_deltas: {
              CO: 0.5,
              CH: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              NET: 5,
              SCI: -3
            },
            relationship_deltas: {
              npc_lindgren: RELD.COLLABORATED
            },
            flags_set: ["took_the_tranche", "stretched_a_claim"]
          },
          failure: {
            text: "An investor brings their own plasma physicist to the review and she asks for the Thomson scattering data. There is none, because there was nothing to scatter from. The tranche moves to December with conditions attached.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              NET: -4
            },
            relationship_deltas: {
              npc_lindgren: RELD.DISAGREED
            },
            flags_set: ["caught_stretching"]
          }
        }
      },
      {
        label: "Hold out for a definition with numbers in it",
        stat_check: {
          stats: ["SM", "GR"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "The board amends the milestone to 100 kiloamps sustained for 200 milliseconds with density measured rather than inferred. You hit it in November, two months late, and nobody argues afterwards about what it was.",
            stat_deltas: {
              SM: 0.5,
              GR: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: 5,
              NET: 2
            },
            relationship_deltas: {
              npc_lindgren: RELD.COLLABORATED
            },
            flags_set: ["defined_the_milestone", "honest_operator"]
          },
          failure: {
            text: "The board keeps the original wording and the quarter ends without either kind of plasma. The tranche is withheld, the hiring plan freezes at sixty-two people, and you were right about all of it.",
            stat_deltas: {
              GR: 0.8
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              SCI: 2,
              NET: -3
            },
            relationship_deltas: {},
            flags_set: ["lean_years"]
          }
        }
      },
      {
        label: "Tell them in April that Q3 is gone",
        outcomes: {
          success: {
            text: "Five months of warning instead of five days. The board is unhappy in the ordinary way rather than the dangerous way, and the tranche gets restructured around a date you can hold. Two directors stop calling you directly and start going through the CEO.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              NET: -5
            },
            relationship_deltas: {
              npc_lindgren: RELD.DISAGREED
            },
            flags_set: ["told_them_early", "honest_operator"]
          }
        }
      }
    ]
  },
  {
    id: "psu_layoffs",
    title: "Nineteen out of ninety-one",
    text: "Burn is 4.1 million a month and the round will not close before March. The CFO needs nineteen names by Friday. Six of the obvious nineteen are the diagnostics group, which is the only reason anyone knows what the machine is doing.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.MID_CAREER, STAGE.SENIOR],
    age_range: [36, 60],
    weight: 3,
    cooldown_years: 5,
    max_fires: 2,
    prerequisites: {
      career_path: PATH.STARTUP
    },
    choices: [
      {
        label: "Cut diagnostics and protect the build",
        stat_check: {
          stats: ["CO", "GR"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "The magnet build holds its schedule and the machine gets assembled on time. For the next fourteen months you run it on three thermocouples and a Rogowski coil, and every result carries an error bar you cannot shrink.",
            stat_deltas: {
              CO: 0.5
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              NET: 2,
              SCI: -4
            },
            relationship_deltas: {},
            flags_set: ["cut_the_measurement"]
          },
          failure: {
            text: "The build holds its schedule and arrives at a machine nobody can characterise. Two campaigns later you rehire two of the six at a premium. One of them says no.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              SCI: -5,
              NET: -2
            },
            relationship_deltas: {
              npc_haddad: RELD.IGNORED
            },
            flags_set: ["cut_the_measurement"]
          }
        }
      },
      {
        label: "Cut across the build team and keep the measurement",
        stat_check: {
          stats: ["SM", "IN"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "Assembly slips eleven weeks and every shot you take afterwards is worth taking. Petrov works two roles for a year and does not mention it once.",
            stat_deltas: {
              SM: 0.5,
              IN: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 4,
              NET: -2
            },
            relationship_deltas: {
              npc_petrov: RELD.COLLABORATED
            },
            flags_set: ["kept_the_measurement"]
          },
          failure: {
            text: "Assembly slips eleven weeks and then five more. The board reads it as a schedule problem, which it is, and asks who is running the build, which is you.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              NET: -4
            },
            relationship_deltas: {},
            flags_set: []
          }
        }
      },
      {
        label: "Keep everyone and shelve the second magnet",
        outcomes: {
          success: {
            text: "Nobody is fired. The second coil set goes into storage half wound, the demonstration slips a year, and the people who kept their jobs work out inside a month what that cost.",
            stat_deltas: {
              CH: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: -3,
              NET: -3
            },
            relationship_deltas: {
              npc_petrov: RELD.DISAGREED
            },
            flags_set: ["shelved_the_magnet"]
          }
        }
      }
    ]
  },
  {
    id: "psu_nda_result",
    title: "The paper legal will not clear",
    text: "Your divertor heat flux data contradicts a scaling three published groups still use. The general counsel's position is that the strike point geometry is a trade secret, and the number goes into no deck that is not the board's.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.EARLY_CAREER, STAGE.MID_CAREER],
    age_range: [30, 55],
    weight: 3,
    cooldown_years: 4,
    max_fires: 2,
    prerequisites: {
      career_path: PATH.STARTUP
    },
    choices: [
      {
        label: "Fight for a redacted version",
        stat_check: {
          stats: ["CH", "SM"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "Six weeks of edits and it clears with every length normalised and the divertor drawn as a box. It is a thinner paper than the one you wrote and it still moves the scaling.",
            stat_deltas: {
              CH: 0.5
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 4,
              PUB: 1
            },
            relationship_deltas: {},
            flags_set: ["published_under_nda"]
          },
          failure: {
            text: "Counsel escalates and returns a memo defining disclosure broadly enough to cover the conference dinner. You put the manuscript in a folder that now has three things in it.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              SCI: -2
            },
            relationship_deltas: {},
            flags_set: ["shelved_a_paper"]
          }
        }
      },
      {
        label: "Give Nakamura the shape of it over a drink",
        stat_check: {
          stats: ["IN", "CH"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "No numbers, just where the curve bends. She recognises the shape. Her group publishes the correction eight months later, thanking a helpful discussion, and the field stops using the wrong scaling.",
            stat_deltas: {
              IN: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {
              SCI: 2,
              NET: 3
            },
            relationship_deltas: {
              npc_nakamura: RELD.HELPED
            },
            flags_set: ["leaked_quietly"]
          },
          failure: {
            text: "Her postdoc cites a private communication in the preprint. Counsel finds it in a routine sweep, and your next conversation about it is with someone from outside the company.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              NET: -4,
              SCI: 1
            },
            relationship_deltas: {
              npc_nakamura: RELD.COLLABORATED
            },
            flags_set: ["caught_leaking"]
          }
        }
      },
      {
        label: "Keep it internal and design against it",
        outcomes: {
          success: {
            text: "The number goes into the next divertor and out of the literature. Three groups spend another two years on a scaling you know is wrong, and your machine gets a plate that survives the campaign.",
            stat_deltas: {
              SM: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: -4,
              PUB: -1
            },
            relationship_deltas: {},
            flags_set: ["kept_it_internal"]
          }
        }
      }
    ]
  },
  {
    id: "psu_investor_demo",
    title: "The shot they flew in for",
    text: "Twenty-two people on the mezzanine, four of them writing cheques next quarter. The quench detection has been throwing a precursor on the inboard coil for nine days and Petrov will not say it is nothing.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.EARLY_CAREER, STAGE.MID_CAREER, STAGE.SENIOR],
    age_range: [32, 62],
    weight: 4,
    cooldown_years: 3,
    max_fires: 3,
    prerequisites: {
      career_path: PATH.STARTUP
    },
    choices: [
      {
        label: "Run the full-field shot",
        stat_check: {
          stats: ["IN", "GR"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "12.4 tesla on the bore, held four seconds, in front of people who mostly could not define a tesla but could tell the room was holding its breath. Petrov finds the precursor a fortnight later in a joint that would have gone in another month.",
            stat_deltas: {
              IN: 0.5,
              GR: 0.3
            },
            stress_delta: STRESS.MAJOR_SUCCESS,
            reputation_deltas: {
              NET: 6,
              SCI: 3
            },
            relationship_deltas: {
              npc_petrov: RELD.COLLABORATED
            },
            flags_set: ["demo_held"]
          },
          failure: {
            text: "The coil goes normal at 9.1 tesla and the cryoplant vents helium into the hall for six minutes while everyone watches, which is a long time to watch anything. Nobody is hurt. Two of the four do not take the second meeting.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              NET: -6
            },
            relationship_deltas: {
              npc_petrov: RELD.COLLABORATED
            },
            flags_set: ["demo_quenched"]
          }
        }
      },
      {
        label: "Derate to eighty percent and say why",
        stat_check: {
          stats: ["CH"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "You show them the precursor trace before you run, then run clean at 9.9 tesla. One of them says afterwards that the derating is why he came back, which may even be true.",
            stat_deltas: {
              CH: 0.5
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              NET: 4,
              SCI: 2
            },
            relationship_deltas: {
              npc_petrov: RELD.SHARED_CREDIT
            },
            flags_set: ["derated_honestly", "honest_operator"]
          },
          failure: {
            text: "You lose the room explaining margin to people who came to see a record. Somebody has the rival's March video open before the coffee is finished.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              NET: -3
            },
            relationship_deltas: {},
            flags_set: []
          }
        }
      },
      {
        label: "Cancel the shot and hand them the quench data",
        outcomes: {
          success: {
            text: "You stand in front of twenty-two people and explain a fault you have not diagnosed. It is the most competent hour you have spent all year and it costs you the quarter. The round closes in July, smaller, with the people who were always going to stay.",
            stat_deltas: {
              CH: 0.3,
              GR: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              NET: -5,
              SCI: 2
            },
            relationship_deltas: {
              npc_petrov: RELD.SHARED_CREDIT
            },
            flags_set: ["cancelled_the_demo", "honest_operator"]
          }
        }
      }
    ]
  },
  {
    id: "psu_competitor_first",
    title: "They announced on a Tuesday",
    text: "A press release with no preprint behind it: a rival claims scientific breakeven on a pulsed machine, yield inferred from activation foils. By ten in the morning you have forty messages and three of them are from directors.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.MID_CAREER, STAGE.SENIOR],
    age_range: [38, 64],
    weight: 3,
    cooldown_years: 4,
    max_fires: 2,
    prerequisites: {
      career_path: PATH.STARTUP
    },
    choices: [
      {
        label: "Take the number apart in public",
        stat_check: {
          stats: ["SM", "IN"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "Two pages showing that foil activation gives yield to a factor of two at best, and that their Q is defined against absorbed energy rather than wall plug. The field reads it. So do your investors, who now want to know your definition.",
            stat_deltas: {
              SM: 0.5
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 5,
              PUB: 2,
              NET: -2
            },
            relationship_deltas: {
              npc_reyes: RELD.COMPETED_WON
            },
            flags_set: ["called_out_a_rival"]
          },
          failure: {
            text: "It reads as sour, because a company that has not done the thing explaining why the thing was not done reads as sour however good the arithmetic is.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              PUB: -4,
              SCI: 1
            },
            relationship_deltas: {
              npc_reyes: RELD.DISAGREED
            },
            flags_set: []
          }
        }
      },
      {
        label: "Say nothing and pull your own milestone forward",
        stat_check: {
          stats: ["GR", "CO"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "Six months of nights and you get there with a neutron count from three independent detectors that agree. Second with numbers turns out to be a defensible place to stand.",
            stat_deltas: {
              GR: 0.8
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 6,
              NET: 3
            },
            relationship_deltas: {},
            flags_set: ["second_with_numbers"]
          },
          failure: {
            text: "The schedule does not compress, in the way schedules never do. You spend six months tired and arrive where you would have arrived anyway, two engineers lighter.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              SCI: 1,
              NET: -2
            },
            relationship_deltas: {},
            flags_set: ["burned_the_team"]
          }
        }
      },
      {
        label: "Call Reyes and ask to see the raw counts",
        outcomes: {
          success: {
            text: "She sends them. They are real and much more modest than the release. You say nothing publicly all week while the story runs without you in it, and you now have a line to the one person who knows what actually happened.",
            stat_deltas: {
              IN: 0.3
            },
            stress_delta: STRESS.RELATIONSHIP_POSITIVE,
            reputation_deltas: {
              PUB: -4
            },
            relationship_deltas: {
              npc_reyes: RELD.COLLABORATED
            },
            flags_set: ["back_channel_to_rival"]
          }
        }
      }
    ]
  },
  {
    id: "psu_secondary_sale",
    title: "The secondary",
    text: "The new lead will buy up to twenty percent of vested employee shares at the round price. On paper your options are worth more than every salary you have ever earned, and paper is the only place they are worth anything.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.MID_CAREER, STAGE.SENIOR],
    age_range: [38, 62],
    weight: 3,
    cooldown_years: 5,
    max_fires: 2,
    prerequisites: {
      career_path: PATH.STARTUP
    },
    choices: [
      {
        label: "Sell the twenty percent",
        outcomes: {
          success: {
            text: "The wire clears in March. You stop doing arithmetic at three in the morning about a mortgage and a magnet at the same time. The cap table is a document people read, and two directors read it.",
            stat_deltas: {
              GR: -0.3
            },
            stress_delta: STRESS.REST,
            reputation_deltas: {
              NET: -4
            },
            relationship_deltas: {
              npc_lindgren: RELD.DISAGREED
            },
            flags_set: ["sold_secondary"]
          }
        }
      },
      {
        label: "Hold all of it",
        stat_check: {
          stats: ["GR", "CO"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "Four years later a utility takes a strategic stake at eleven times the price and the number becomes real in a bank rather than a spreadsheet. You are at the machine the morning it clears, and you stay there.",
            stat_deltas: {
              GR: 0.5,
              CO: 0.5
            },
            stress_delta: STRESS.MAJOR_SUCCESS,
            reputation_deltas: {
              NET: 5
            },
            relationship_deltas: {},
            flags_set: ["held_the_equity"]
          },
          failure: {
            text: "The next round comes in flat with a two times participating preference, and common sits under a stack it does not climb out of. You paid the exercise tax in a year when the shares were worth something.",
            stat_deltas: {
              GR: 0.8
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["equity_underwater"]
          }
        }
      }
    ]
  },
  {
    id: "psu_physics_vs_deck",
    title: "The answer the deck needs",
    text: "Your transport model says confinement degrades above a density you have to exceed, and the fix is a machine forty percent larger than the one you are funded for. The deck says next machine, breakeven. Both sentences are defensible and one of them is true.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.MID_CAREER, STAGE.SENIOR],
    age_range: [38, 64],
    weight: 4,
    cooldown_years: 4,
    max_fires: 2,
    prerequisites: {
      career_path: PATH.STARTUP
    },
    choices: [
      {
        label: "Put the model in the board pack unedited",
        stat_check: {
          stats: ["SM", "CH"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "Two of the seven directors have built hardware and they read the appendix first. The company reorganises around a larger machine and a longer raise, and the eighteen months it costs are the eighteen months that make the thing possible.",
            stat_deltas: {
              SM: 0.5
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 6,
              NET: 2
            },
            relationship_deltas: {
              npc_lindgren: RELD.COLLABORATED
            },
            flags_set: ["physics_won"]
          },
          failure: {
            text: "The slide comes out of the pack before the meeting and you are told it was a formatting decision. From that quarter you are the person who is careful, which in this building is not a compliment.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              SCI: 2,
              NET: -5
            },
            relationship_deltas: {
              npc_lindgren: RELD.DISAGREED
            },
            flags_set: ["sidelined"]
          }
        }
      },
      {
        label: "Present both cases and let the board pick",
        stat_check: {
          stats: ["CH", "CO"],
          modifier: 0.1
        },
        outcomes: {
          success: {
            text: "The physics case and the fundable case side by side, each with the assumptions it needs. They take the fundable one and fund a scoping study for the other, which is more than you expected and less than you wanted.",
            stat_deltas: {
              CH: 0.5,
              CO: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              NET: 3,
              SCI: 1
            },
            relationship_deltas: {
              npc_lindgren: RELD.COLLABORATED
            },
            flags_set: ["split_the_difference"]
          },
          failure: {
            text: "Given two answers the room takes the one with the earlier date, and stops listening at the point where you conceded there was a case for it.",
            stat_deltas: {
              CH: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              SCI: -2
            },
            relationship_deltas: {},
            flags_set: []
          }
        }
      },
      {
        label: "Leave it in the appendix and build what is funded",
        outcomes: {
          success: {
            text: "The build continues and so does the hiring. The density limit is still in the appendix two years later when the machine finds it experimentally, on schedule, within eight percent of where the model put it.",
            stat_deltas: {
              IN: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: -5,
              NET: 2
            },
            relationship_deltas: {},
            flags_set: ["buried_the_model"]
          }
        }
      }
    ]
  },
  {
    id: "psu_poaching_hire",
    title: "What you can honestly offer Kaur",
    text: "Kaur runs neutron diagnostics at a national lab. She is forty-one, has a pension and two children in school. You can offer a title, a machine that will run inside three years, and options with a strike price and no market to sell into.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.EARLY_CAREER, STAGE.MID_CAREER],
    age_range: [32, 55],
    weight: 3,
    cooldown_years: 4,
    max_fires: 2,
    prerequisites: {
      career_path: PATH.STARTUP
    },
    choices: [
      {
        label: "Walk her through what the equity is worth today, which is nothing",
        stat_check: {
          stats: ["CH", "CO"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "The preference stack, the odds, the strike price. She takes the job anyway, for the machine. She is still there through two down rounds and a leadership change, and never once says she was misled.",
            stat_deltas: {
              CH: 0.5,
              CO: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: 4,
              NET: 3
            },
            relationship_deltas: {
              npc_kaur: RELD.COLLABORATED
            },
            flags_set: ["hired_honestly", "honest_operator"]
          },
          failure: {
            text: "She thanks you for the honesty, which is real, and stays where the pension is, which is also real. The diagnostics lead you hire instead is competent and eleven years younger.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              SCI: -2
            },
            relationship_deltas: {
              npc_kaur: RELD.DISAGREED
            },
            flags_set: []
          }
        }
      },
      {
        label: "Give her the version where the options are real",
        stat_check: {
          stats: ["CH"],
          modifier: 0.1
        },
        outcomes: {
          success: {
            text: "She joins in six weeks and builds a neutron diagnostic suite nobody else in the sector has. She works out what the shares are worth about a year in, from the 409A, and the way she looks at you in meetings changes permanently.",
            stat_deltas: {
              CO: 0.5
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {
              SCI: 5,
              NET: 2
            },
            relationship_deltas: {
              npc_kaur: RELD.DISAGREED
            },
            flags_set: ["oversold_the_equity"]
          },
          failure: {
            text: "She asks a brother-in-law who does venture law to read the documents before she signs. He reads them. She calls to withdraw and is polite about the reason.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              NET: -4
            },
            relationship_deltas: {
              npc_kaur: RELD.DISAGREED
            },
            flags_set: ["caught_stretching"]
          }
        }
      },
      {
        label: "Stop recruiting her and hire two graduates",
        outcomes: {
          success: {
            text: "Two twenty-six-year-olds who will be very good in five years and are not good now. The diagnostics get done a level below where they needed to be done for three years, and your Tuesdays come back.",
            stat_deltas: {
              CH: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: -3
            },
            relationship_deltas: {
              npc_kaur: RELD.IGNORED
            },
            flags_set: ["hired_cheap"]
          }
        }
      }
    ]
  },
  {
    id: "psu_tritium_license",
    title: "Deuterium is easier",
    text: "D-T gives you fourteen MeV neutrons and a number investors already understand. It also gives you a byproduct materials licence, a tritium inventory accounted to the gram, and about eighteen months of paperwork nobody put in the plan.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.MID_CAREER, STAGE.SENIOR],
    age_range: [38, 62],
    weight: 3,
    cooldown_years: 5,
    max_fires: 1,
    prerequisites: {
      career_path: PATH.STARTUP
    },
    choices: [
      {
        label: "Start the licensing now and run D-D meanwhile",
        stat_check: {
          stats: ["GR", "CO"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "Twenty-two months, one agreement state, one reviewer with forty other files on her desk. The licence lands two months before the machine needs it, which is as close to a triumph as paperwork offers.",
            stat_deltas: {
              GR: 0.8,
              CO: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 5,
              NET: 3
            },
            relationship_deltas: {},
            flags_set: ["licensed_for_tritium"]
          },
          failure: {
            text: "The submission comes back twice with comments on the tritium accountancy. The machine sits cold for five months waiting on a signature, and you budget the delay properly next time.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              NET: -3
            },
            relationship_deltas: {},
            flags_set: ["licensing_delay"]
          }
        }
      },
      {
        label: "Stay on deuterium and quote the equivalent",
        outcomes: {
          success: {
            text: "You run D-D, scale the yield to what D-T would have given, and label it clearly in the paper and less clearly in the release. Everyone in the field does this. Everyone in the field also knows what it means that you did.",
            stat_deltas: {
              SM: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: -4,
              PUB: 2
            },
            relationship_deltas: {},
            flags_set: ["dd_equivalent"]
          }
        }
      }
    ]
  },
  {
    id: "psu_quench_at_two_am",
    title: "Two in the morning, inboard coil",
    text: "The coil goes normal partway up a ramp and dumps its stored energy into the cold mass. Nobody is hurt, nothing is burning, and the shift log entry is eleven words long. The board meets Thursday.",
    type: EVENT_TYPE.RANDOM,
    stage: [STAGE.EARLY_CAREER, STAGE.MID_CAREER],
    age_range: [30, 58],
    weight: 3,
    cooldown_years: 3,
    max_fires: 3,
    prerequisites: {
      career_path: PATH.STARTUP
    },
    choices: [
      {
        label: "Put the whole incident in Thursday's pack",
        stat_check: {
          stats: ["SM", "CH"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "Eight slides, including the joint resistance data that explains it. A director who spent thirty years on jet engines says it is the first honest failure report he has had from a company at this stage, and means it.",
            stat_deltas: {
              SM: 0.3,
              CH: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              NET: 3,
              SCI: 2
            },
            relationship_deltas: {
              npc_petrov: RELD.SHARED_CREDIT
            },
            flags_set: ["reported_the_quench"]
          },
          failure: {
            text: "The observer forwards the pack to his partners the same afternoon. The next term sheet carries a diligence condition and a tranche tied to coil qualification, which is now somebody else's number.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              NET: -4
            },
            relationship_deltas: {},
            flags_set: ["diligence_condition"]
          }
        }
      },
      {
        label: "Log it as a planned ramp test and fix it quietly",
        outcomes: {
          success: {
            text: "Petrov reworks the joint in nine days and says nothing in the corridor. The company stays calm, the round proceeds on the timetable it needs, and there is now a thing four people know that the board does not.",
            stat_deltas: {
              CO: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: -4,
              NET: 2
            },
            relationship_deltas: {
              npc_petrov: RELD.COLLABORATED
            },
            flags_set: ["hid_the_quench"]
          }
        }
      }
    ]
  },
  {
    id: "psu_board_observer",
    title: "The observer at standup",
    text: "The lead investor's board observer starts attending the Monday engineering standup. He is thirty-one, came out of growth marketing, and has begun using the word cadence about magnet winding.",
    type: EVENT_TYPE.RANDOM,
    stage: [STAGE.MID_CAREER, STAGE.SENIOR],
    age_range: [36, 64],
    weight: 2,
    cooldown_years: 3,
    max_fires: 2,
    prerequisites: {
      career_path: PATH.STARTUP
    },
    choices: [
      {
        label: "Give him something real to own",
        stat_check: {
          stats: ["CH", "CO"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "You hand him the long-lead procurement tracker, which is genuinely useful and genuinely nobody's job. He does it well, learns what a cryostat costs, and argues your corner in the partner meeting you are not in.",
            stat_deltas: {
              CH: 0.5,
              CO: 0.5
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              NET: 5
            },
            relationship_deltas: {
              npc_lindgren: RELD.COLLABORATED
            },
            flags_set: ["turned_the_observer"]
          },
          failure: {
            text: "He owns the schedule now, which means the schedule is a document written for his partners. Every date on it is a date somebody outside the building will hold you to.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              NET: -2
            },
            relationship_deltas: {},
            flags_set: ["schedule_captured"]
          }
        }
      },
      {
        label: "Ask the CEO to keep him out of engineering",
        outcomes: {
          success: {
            text: "It works, and it takes about four minutes to get around the building that it happened. Your Mondays come back. The partner who sent him stops asking you questions and starts asking about you.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              NET: -4
            },
            relationship_deltas: {
              npc_lindgren: RELD.DISAGREED
            },
            flags_set: ["closed_the_door"]
          }
        }
      }
    ]
  },
  {
    id: "psu_recruiter_call",
    title: "The week your tranche vests",
    text: "A recruiter for the company that announced in March calls in the same week your second tranche vests. They have a machine that runs, a cryoplant twice the size of yours, and no interest in pretending the timing is a coincidence.",
    type: EVENT_TYPE.RANDOM,
    stage: [STAGE.EARLY_CAREER, STAGE.MID_CAREER],
    age_range: [32, 58],
    weight: 2,
    cooldown_years: 4,
    max_fires: 2,
    prerequisites: {
      career_path: PATH.STARTUP
    },
    choices: [
      {
        label: "Take the interview and see the number",
        stat_check: {
          stats: ["CO", "CH"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "Forty percent higher with liquid equity behind it. You bring it back, get most of it matched, and stay somewhere you actually want to be at a price that finally reflects it.",
            stat_deltas: {
              CO: 0.5
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              NET: 3
            },
            relationship_deltas: {},
            flags_set: ["repriced_yourself"]
          },
          failure: {
            text: "Somebody from your own supply chain sees you in their lobby. Nothing is said and nothing is the same, and you are on the list of people who might go next time there is a list.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              NET: -3
            },
            relationship_deltas: {
              npc_lindgren: RELD.DISAGREED
            },
            flags_set: ["flagged_as_flight_risk"]
          }
        }
      },
      {
        label: "Say no on the call",
        outcomes: {
          success: {
            text: "Ninety seconds, then back to the control room. You wonder about the number for about a year. He does not call again, including the year they are hiring for the role you would have wanted.",
            stat_deltas: {
              GR: 0.3,
              CO: -0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              NET: -2
            },
            relationship_deltas: {},
            flags_set: ["declined_the_recruiter"]
          }
        }
      }
    ]
  },
  {
    id: "psu_bridge_note",
    title: "Three ways to be diluted",
    text: "Eleven months of runway at current burn and the round will not clear at the last valuation. Three options on the table, all of them dilution with different names on them.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.MID_CAREER, STAGE.SENIOR],
    age_range: [38, 64],
    weight: 4,
    cooldown_years: 5,
    max_fires: 2,
    prerequisites: {
      career_path: PATH.STARTUP
    },
    choices: [
      {
        label: "Take the down round and reprice cleanly",
        stat_check: {
          stats: ["CH", "CO"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "Valuation halves, the option pool refreshes, and everyone who stayed gets paper that might be worth something again. The engineers who understand the mechanics understand exactly what you did for them.",
            stat_deltas: {
              CH: 0.5
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              NET: 3,
              SCI: 2
            },
            relationship_deltas: {
              npc_kaur: RELD.HELPED
            },
            flags_set: ["clean_down_round", "honest_operator"]
          },
          failure: {
            text: "The reprice goes through and the story travels faster than the paperwork. Four senior people leave in six weeks, two of them to the company that announced in March.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              NET: -5
            },
            relationship_deltas: {
              npc_kaur: RELD.DISAGREED
            },
            flags_set: ["lost_the_seniors"]
          }
        }
      },
      {
        label: "Take the strategic money from the utility",
        stat_check: {
          stats: ["CO", "CH"],
          modifier: 0.1
        },
        outcomes: {
          success: {
            text: "Money and a first customer in the same wire, and a grid operator with a reason to care whether this works. Every subsequent investor asks about their rights, and you answer that question a hundred times.",
            stat_deltas: {
              CO: 0.8
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              NET: 5,
              PUB: 2
            },
            relationship_deltas: {},
            flags_set: ["strategic_investor"]
          },
          failure: {
            text: "The term sheet carries a right of first refusal on the technology, and it is visible in every data room from then on. Two later funds pass without saying that is why.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              NET: -4
            },
            relationship_deltas: {},
            flags_set: ["encumbered_the_cap_table"]
          }
        }
      },
      {
        label: "Cut burn to eighteen months and raise nothing",
        outcomes: {
          success: {
            text: "The contractors go, the second test stand goes, the tritium work goes back in a drawer. You stop fundraising for a year and do physics for the first time since the Series A, on a schedule that has slipped past everything you promised anyone.",
            stat_deltas: {
              IN: 0.5
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              NET: -5,
              SCI: -2
            },
            relationship_deltas: {},
            flags_set: ["went_lean"]
          }
        }
      }
    ]
  },
  {
    id: "psu_shop_floor_photo",
    title: "The photo on the forum",
    text: "A technician posts a picture of the vessel with the port flanges in shot. Two thousand people see it inside a day, one of them works for a competitor, and the agreement she signed covers exactly this.",
    type: EVENT_TYPE.RANDOM,
    stage: [STAGE.EARLY_CAREER, STAGE.MID_CAREER],
    age_range: [32, 58],
    weight: 2,
    cooldown_years: 3,
    max_fires: 2,
    prerequisites: {
      career_path: PATH.STARTUP
    },
    choices: [
      {
        label: "Terminate the same day, as the policy says",
        stat_check: {
          stats: ["CO", "GR"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "Counsel is satisfied and the board is satisfied, and nothing goes on the internet from that floor again. Neither does much else. The shift reports get shorter and you stop hearing about problems in week one.",
            stat_deltas: {
              CO: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {
              NET: 2,
              SCI: -2
            },
            relationship_deltas: {
              npc_haddad: RELD.DISAGREED
            },
            flags_set: ["fired_the_technician"]
          },
          failure: {
            text: "Two of the best technicians resign inside a month and the third tells you why on his way out. The photo is still on the forum. It cannot be taken off the forum.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              NET: -4
            },
            relationship_deltas: {
              npc_haddad: RELD.DISAGREED
            },
            flags_set: ["lost_the_floor"]
          }
        }
      },
      {
        label: "Leave it up, and take the clause out of the handbook",
        outcomes: {
          success: {
            text: "She keeps her job and the picture stays where it is. Counsel notes the decision in writing, in the way that means it will be read back to you later, and the floor learns something about you that is worth more than a flange drawing.",
            stat_deltas: {
              CH: 0.3
            },
            stress_delta: STRESS.RELATIONSHIP_POSITIVE,
            reputation_deltas: {
              NET: -3,
              SCI: -1
            },
            relationship_deltas: {
              npc_haddad: RELD.HELPED
            },
            flags_set: ["protected_the_floor"]
          }
        }
      }
    ]
  },
  {
    id: "pin_seven_am_call",
    title: "Seven in the morning in Provence",
    text: "The integrated design review runs at 07:00 local so that Naka and Oak Ridge can both be awake for it. You have read the whole annex. The two people who wrote it are on mute.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.EARLY_CAREER],
    age_range: [28, 38],
    weight: 3,
    cooldown_years: 3,
    max_fires: 2,
    prerequisites: {
      career_path: PATH.INTERNATIONAL
    },
    choices: [
      {
        label: "Raise the interface discrepancy on the call",
        stat_check: {
          stats: ["CH", "SM"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "You say it in ninety seconds and in the plainest English you own. The chair asks for a written note by Friday, which in this building is what agreement sounds like.",
            stat_deltas: {
              CH: 0.4,
              SM: 0.2
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 2,
              NET: 2
            },
            relationship_deltas: {
              npc_mbeki: RELD.COLLABORATED
            },
            flags_set: ["spoke_up_in_review"]
          },
          failure: {
            text: "It comes out as a question rather than a finding, and the chair takes it as a request for clarification. The annex ships unchanged. The discrepancy surfaces in fabrication nineteen months later with your initials on the review record.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              SCI: -1
            },
            relationship_deltas: {},
            flags_set: ["discrepancy_shipped"]
          }
        }
      },
      {
        label: "Write it up afterwards as a formal non-conformity note",
        stat_check: {
          stats: ["GR", "SM"],
          modifier: 0.1
        },
        outcomes: {
          success: {
            text: "Four pages, both unit systems, sent to eleven people across six time zones. It takes six weeks and two escalations, and the drawing changes. Nobody on the call remembers who raised it.",
            stat_deltas: {
              GR: 0.4,
              SM: 0.2
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 3
            },
            relationship_deltas: {},
            flags_set: ["works_the_paper_trail"]
          },
          failure: {
            text: "The note is correct and lands in a queue behind ninety others. Six months on it is closed as a duplicate of an issue a domestic agency raised in their own language, which is where the credit goes.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: []
          }
        }
      },
      {
        label: "Take the minutes, say nothing, sleep at a normal hour",
        outcomes: {
          success: {
            text: "You write the cleanest minutes the review has had and hand them over by nine. Four consecutive nights that do not begin at half past five. The discrepancy belongs to somebody else now, and stays that way.",
            stat_deltas: {},
            stress_delta: STRESS.REST,
            reputation_deltas: {
              SCI: -1,
              NET: -1
            },
            relationship_deltas: {},
            flags_set: ["kept_your_head_down"]
          }
        }
      }
    ]
  },
  {
    id: "pin_flange_tolerance",
    title: "Two factories, one flange",
    text: "The sector is built in one member state and the port extension in another. The interface tolerance was allocated in a procurement arrangement rather than by anyone doing a stack up, and the result is four millimetres of nobody's fault.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.EARLY_CAREER, STAGE.MID_CAREER],
    age_range: [30, 50],
    weight: 3,
    cooldown_years: 4,
    max_fires: 2,
    prerequisites: {
      career_path: PATH.INTERNATIONAL
    },
    choices: [
      {
        label: "Absorb it on your side with a machined shim ring",
        stat_check: {
          stats: ["SM", "IN"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "You design the ring, qualify it, and it holds. Your agency eats forty weeks of schedule and the fix becomes the standard solution for the remaining sixteen interfaces.",
            stat_deltas: {
              SM: 0.4,
              IN: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 3,
              NET: 3
            },
            relationship_deltas: {
              npc_petrov: RELD.HELPED
            },
            flags_set: ["ate_the_tolerance"]
          },
          failure: {
            text: "The ring passes analysis and fails weld qualification at temperature. Six months later you are back at the same table with less credibility and the same four millimetres.",
            stat_deltas: {
              GR: 0.4
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              SCI: -2
            },
            relationship_deltas: {},
            flags_set: []
          }
        }
      },
      {
        label: "Send it to the interface control board",
        stat_check: {
          stats: ["CH", "CO"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "Eleven months, two working groups and a ruling that splits the deviation two millimetres each way. It is the correct engineering answer and it is eleven months.",
            stat_deltas: {
              CH: 0.4,
              CO: 0.4
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              NET: 4
            },
            relationship_deltas: {
              npc_mbeki: RELD.COLLABORATED
            },
            flags_set: ["used_the_process"]
          },
          failure: {
            text: "The board defers twice and then rules that the tolerance was always yours to hold. You hold it, late, with a shim designed under time pressure by somebody who has never seen the joint.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              NET: -2
            },
            relationship_deltas: {},
            flags_set: []
          }
        }
      }
    ]
  },
  {
    id: "pin_manosque_school",
    title: "The school in Manosque",
    text: "Five years, offered as three plus two. The international school will take your children in the English section, your partner's licence to practise does not transfer, and the nearest work in her field is ninety minutes away in Marseille.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.EARLY_CAREER, STAGE.MID_CAREER],
    age_range: [30, 46],
    weight: 3,
    cooldown_years: 5,
    max_fires: 1,
    prerequisites: {
      career_path: PATH.INTERNATIONAL
    },
    choices: [
      {
        label: "Move everyone and commit to the full five",
        stat_check: {
          stats: ["GR", "CH"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "October is unspeakable. By June there is a child correcting your French at dinner and a partner running a practice out of Aix under a title she did not train for. You are on site for the sector welding, every day of it.",
            stat_deltas: {
              GR: 0.5,
              CH: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 3,
              NET: 4
            },
            relationship_deltas: {
              npc_mbeki: RELD.COLLABORATED
            },
            flags_set: ["family_moved"]
          },
          failure: {
            text: "The English section has a waiting list, the licence never transfers, and by the second winter every conversation at home is the same conversation. You stay. So does the argument.",
            stat_deltas: {
              GR: 0.4
            },
            stress_delta: STRESS.LIFE_EVENT,
            reputation_deltas: {
              SCI: 2
            },
            relationship_deltas: {},
            flags_set: ["family_moved", "family_strain"]
          }
        }
      },
      {
        label: "Take the post alone and fly back monthly",
        stat_check: {
          stats: ["GR"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "Fourteen flights a year, a studio in Vinon, and a life organised around Friday evening departures. You are present for the work and adequate at home, and you know which is which.",
            stat_deltas: {
              GR: 0.5,
              IN: 0.2
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 4,
              NET: 3
            },
            relationship_deltas: {},
            flags_set: ["commuter_years"]
          },
          failure: {
            text: "Two flights are cancelled in the same month and you miss the thing you promised you would not miss. Nobody makes a scene about it, which is how you know.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.LIFE_EVENT,
            reputation_deltas: {
              SCI: 2
            },
            relationship_deltas: {},
            flags_set: ["commuter_years", "family_strain"]
          }
        }
      },
      {
        label: "Sign the three years and decline the extension",
        outcomes: {
          success: {
            text: "You tell the head of section on your first day that you are here for three years. It costs you the deputy role and every conversation about what happens after 2039, and you stop lying to your family about dates.",
            stat_deltas: {
              GR: 0.2
            },
            stress_delta: STRESS.RELATIONSHIP_POSITIVE,
            reputation_deltas: {
              NET: -3
            },
            relationship_deltas: {},
            flags_set: ["three_year_contract"]
          }
        }
      }
    ]
  },
  {
    id: "pin_customs_fos",
    title: "Eleven weeks at the port",
    text: "A gyrotron ships from a member state and stops at Fos-sur-Mer over a customs code that describes it, accurately and unhelpfully, as a microwave heating component. The installation window opens in three weeks.",
    type: EVENT_TYPE.RANDOM,
    stage: [STAGE.EARLY_CAREER, STAGE.MID_CAREER],
    age_range: [30, 52],
    weight: 2,
    cooldown_years: 4,
    max_fires: 2,
    prerequisites: {
      career_path: PATH.INTERNATIONAL
    },
    choices: [
      {
        label: "Go to Marseille and sit in the office until it clears",
        stat_check: {
          stats: ["GR", "CH"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "Four days, three offices and a translator you pay for yourself. The container moves on the Friday and the window holds by nine days.",
            stat_deltas: {
              GR: 0.4,
              CH: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              NET: 3,
              SCI: 1
            },
            relationship_deltas: {
              npc_petrov: RELD.HELPED
            },
            flags_set: ["unblocked_the_shipment"]
          },
          failure: {
            text: "You learn a great deal about tariff classification and nothing moves. It clears the week it was always going to clear, and you have spent four days and a favour on it.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: []
          }
        }
      },
      {
        label: "Let the domestic agency handle their own paperwork",
        outcomes: {
          success: {
            text: "Their shipment, their customs code, their eleven weeks. You resequence the installation around a hole in the schedule and take the first weekend off since March. Commissioning moves a quarter, and the file records the delay as upstream.",
            stat_deltas: {},
            stress_delta: STRESS.REST,
            reputation_deltas: {
              SCI: -2,
              NET: -1
            },
            relationship_deltas: {},
            flags_set: ["let_it_slip"]
          }
        }
      }
    ]
  },
  {
    id: "pin_wrong_code_supports",
    title: "Qualified to the wrong code",
    text: "Sixty support brackets, fabricated to ASME Section III because that is what the supplier has built to for forty years. The safety file for the site is written to RCC-MR, and the regulator reads only the second one.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.MID_CAREER, STAGE.SENIOR],
    age_range: [36, 60],
    weight: 4,
    cooldown_years: 5,
    max_fires: 1,
    prerequisites: {
      career_path: PATH.INTERNATIONAL
    },
    choices: [
      {
        label: "Requalify by analysis and keep the parts",
        stat_check: {
          stats: ["SM", "GR"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "Nine months of finite element work and a report thicker than the original design file. The brackets stay, the safety case holds, and you have written the precedent the next four suppliers will use.",
            stat_deltas: {
              SM: 0.5,
              GR: 0.4
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 4,
              NET: 3
            },
            relationship_deltas: {
              npc_reyes: RELD.COLLABORATED
            },
            flags_set: ["requalified_by_analysis"]
          },
          failure: {
            text: "The analysis is sound and the inspector still wants material traceability the supplier never recorded. Sixty brackets, nine months, and a scrap note written in three languages.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              SCI: -2
            },
            relationship_deltas: {},
            flags_set: ["scrapped_the_batch"]
          }
        }
      },
      {
        label: "Reject the batch and make them refabricate",
        stat_check: {
          stats: ["CH", "CO"],
          modifier: 0.1
        },
        outcomes: {
          success: {
            text: "The agency refabricates at their own cost, because you make the case privately a week before you make it in the minutes. Fourteen months, and nothing in the file anyone has to defend in twenty years.",
            stat_deltas: {
              CH: 0.4,
              CO: 0.4
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 3,
              NET: 2
            },
            relationship_deltas: {
              npc_mbeki: RELD.COLLABORATED
            },
            flags_set: ["held_the_standard"]
          },
          failure: {
            text: "They refabricate, slowly, and every schedule meeting for a year opens with the brackets. Two members table a note about the cost of unilateral rejections, and your name is in it.",
            stat_deltas: {
              GR: 0.4
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              NET: -3
            },
            relationship_deltas: {
              npc_dubois: RELD.DISAGREED
            },
            flags_set: []
          }
        }
      },
      {
        label: "Raise a deviation request and install them",
        outcomes: {
          success: {
            text: "The deviation is arguable, and argued, and accepted. The brackets go in, fourteen months stay in the schedule, and the file carries a line that somebody will read very carefully in 2041 if a support ever moves. You sleep, mostly.",
            stat_deltas: {
              CO: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: -3
            },
            relationship_deltas: {},
            flags_set: ["took_the_deviation"]
          }
        }
      }
    ]
  },
  {
    id: "pin_nine_hundred_authors",
    title: "Nine hundred and forty names",
    text: "The integrated modelling paper goes out with the whole collaboration on it, alphabetical, no contribution statement. Two years of your divertor work is section 4.3 and half a sentence of the abstract.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.MID_CAREER],
    age_range: [34, 55],
    weight: 3,
    cooldown_years: 3,
    max_fires: 2,
    prerequisites: {
      career_path: PATH.INTERNATIONAL
    },
    choices: [
      {
        label: "Write the standalone paper on 4.3",
        stat_check: {
          stats: ["SM", "GR"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "Twelve pages, four authors, your name first. It is cited by the people who actually do the work and by almost nobody else, and it is the paper you can point at.",
            stat_deltas: {
              SM: 0.4,
              GR: 0.2
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 4
            },
            relationship_deltas: {
              npc_iwasaki: RELD.COLLABORATED
            },
            flags_set: ["carved_out_a_paper"]
          },
          failure: {
            text: "The publication board holds it for eight months on the grounds that it duplicates section 4.3. It appears eventually, after the review it was written to inform.",
            stat_deltas: {
              GR: 0.4
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              SCI: 1
            },
            relationship_deltas: {},
            flags_set: []
          }
        }
      },
      {
        label: "Push the collaboration to adopt contribution statements",
        stat_check: {
          stats: ["CH", "CO"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "Three months of email across nine time zones and one very long meeting. The policy changes for every paper after this one. Everybody who comes after you benefits and none of them will know why.",
            stat_deltas: {
              CH: 0.5,
              CO: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              NET: 5,
              SCI: 1
            },
            relationship_deltas: {
              npc_mbeki: RELD.COLLABORATED
            },
            flags_set: ["changed_the_policy"]
          },
          failure: {
            text: "The board declines, citing precedent from the previous four hundred papers. You are thanked for raising it and asked, privately, whether this is really the hill.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              NET: -1
            },
            relationship_deltas: {},
            flags_set: []
          }
        }
      },
      {
        label: "Approve it and get back to the run plan",
        outcomes: {
          success: {
            text: "You are name four hundred and eleven of nine hundred and forty and it takes nine seconds to sign off. The work is in the world, stated correctly, and no committee owns your evenings this quarter.",
            stat_deltas: {},
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: -2
            },
            relationship_deltas: {},
            flags_set: ["signed_the_long_list"]
          }
        }
      }
    ]
  },
  {
    id: "pin_two_versions",
    title: "The binding version",
    text: "The specification exists in English and in French. The English one is what the engineers designed to. The French one is what the regulator reads, and in clause 7 the two do not say the same thing about test pressure.",
    type: EVENT_TYPE.RANDOM,
    stage: [STAGE.MID_CAREER, STAGE.SENIOR],
    age_range: [35, 62],
    weight: 2,
    cooldown_years: 4,
    max_fires: 2,
    prerequisites: {
      career_path: PATH.INTERNATIONAL
    },
    choices: [
      {
        label: "Stop the qualification test until the texts agree",
        stat_check: {
          stats: ["SM", "GR"],
          modifier: 0.1
        },
        outcomes: {
          success: {
            text: "You stop a test that fourteen people flew in for. The translation is corrected, the test runs six weeks later to the pressure the file actually requires, and the vessel is never the thing anyone worries about again.",
            stat_deltas: {
              SM: 0.3,
              GR: 0.4
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 4,
              NET: 2
            },
            relationship_deltas: {
              npc_petrov: RELD.COLLABORATED
            },
            flags_set: ["stopped_the_test"]
          },
          failure: {
            text: "You stop the test and the discrepancy turns out to be a comma. Fourteen people rebook, six weeks are gone, and your name attaches to caution in a way that is not entirely a compliment.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              NET: -2
            },
            relationship_deltas: {},
            flags_set: []
          }
        }
      },
      {
        label: "Test to the English number and correct the text afterwards",
        outcomes: {
          success: {
            text: "The test runs on the day, to the number the engineers designed to, which is almost certainly the right number. The French text is amended the following quarter to say what the test already did. Nobody is ever going to check the order of those two events.",
            stat_deltas: {
              CO: 0.2
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: -2
            },
            relationship_deltas: {},
            flags_set: ["ran_to_the_english_text"]
          }
        }
      }
    ]
  },
  {
    id: "pin_credit_units",
    title: "Credit for a component that does not work",
    text: "A member state has delivered its share of the in-kind value on paper. The hardware is on site, in crates, failing acceptance on two of nine tests, and the credit is booked either way.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.MID_CAREER, STAGE.SENIOR],
    age_range: [42, 63],
    weight: 3,
    cooldown_years: 4,
    max_fires: 1,
    prerequisites: {
      career_path: PATH.INTERNATIONAL
    },
    choices: [
      {
        label: "Withhold acceptance and put the reason in the minutes",
        stat_check: {
          stats: ["GR", "CH"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "The minutes are read at the November council. The credit is held, the repairs are funded from their side, and one delegation stops taking your calls for two years.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 5,
              NET: -2
            },
            relationship_deltas: {
              npc_dubois: RELD.DISAGREED
            },
            flags_set: ["withheld_acceptance"]
          },
          failure: {
            text: "The credit is released over your signature by people with more standing and a broader view of the programme. The crates stay shut for another eighteen months and the tests stay failed.",
            stat_deltas: {
              GR: 0.4
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              NET: -3
            },
            relationship_deltas: {
              npc_mbeki: RELD.DISAGREED
            },
            flags_set: []
          }
        }
      },
      {
        label: "Accept with a punch list and repair it on site",
        stat_check: {
          stats: ["SM", "CO"],
          modifier: 0.1
        },
        outcomes: {
          success: {
            text: "Your team repairs another country's hardware in a tent on the platform for nine months. It works. The credit stands, the relationship stands, and the record says the component was delivered functional.",
            stat_deltas: {
              SM: 0.3,
              CO: 0.5
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              NET: 5,
              SCI: -1
            },
            relationship_deltas: {
              npc_mbeki: RELD.HELPED
            },
            flags_set: ["fixed_it_on_site"]
          },
          failure: {
            text: "Nine months in the tent, and the second failure mode is in the design rather than the build. You have spent your budget and your goodwill and the crates still do not pass.",
            stat_deltas: {
              GR: 0.4
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              SCI: -3
            },
            relationship_deltas: {},
            flags_set: []
          }
        }
      }
    ]
  },
  {
    id: "pin_sector_metrology",
    title: "Measured twice, in two countries",
    text: "The vacuum vessel sector passes dimensional inspection at the factory and fails it on arrival. Both metrology teams are competent, both reports are internally consistent, and they differ by six millimetres.",
    type: EVENT_TYPE.RANDOM,
    stage: [STAGE.MID_CAREER, STAGE.SENIOR],
    age_range: [38, 62],
    weight: 3,
    cooldown_years: 4,
    max_fires: 1,
    prerequisites: {
      career_path: PATH.INTERNATIONAL
    },
    choices: [
      {
        label: "Send both teams the same reference artefact and start again",
        stat_check: {
          stats: ["SM", "GR"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "Two months, one calibrated artefact, and a thermal correction that one team applied and the other did not. The sector was always in tolerance. The procedure that allowed this is retired.",
            stat_deltas: {
              SM: 0.5,
              GR: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 4,
              NET: 3
            },
            relationship_deltas: {
              npc_petrov: RELD.COLLABORATED
            },
            flags_set: ["found_the_metrology_error"]
          },
          failure: {
            text: "The artefact agrees with neither report. You are three months in with a sector on a stand, two national labs defending their instruments, and a weld window that closed in March.",
            stat_deltas: {
              GR: 0.4
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              SCI: -1
            },
            relationship_deltas: {},
            flags_set: []
          }
        }
      },
      {
        label: "Take the on-site number and machine to it",
        stat_check: {
          stats: ["IN", "CO"],
          modifier: 0.1
        },
        outcomes: {
          success: {
            text: "You believe the measurement made by the people who have to live with the joint. It closes, the gap map is inside allowance, and the factory files a note disagreeing with you that nobody ever opens.",
            stat_deltas: {
              IN: 0.4
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              NET: 2,
              SCI: 1
            },
            relationship_deltas: {
              npc_dubois: RELD.DISAGREED
            },
            flags_set: ["machined_to_site"]
          },
          failure: {
            text: "The on-site number was the wrong one. You have removed metal you cannot put back, and the corrective action report runs to eighty pages across four organisations.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              SCI: -4
            },
            relationship_deltas: {},
            flags_set: []
          }
        }
      }
    ]
  },
  {
    id: "pin_thesis_before_first_plasma",
    title: "A thesis on a machine that will not run in time",
    text: "Agarwal wants to do her doctorate on the divertor you are building. First plasma is scheduled after her defence, so every number in the thesis would come from simulation and a mock-up on a test stand.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.MID_CAREER],
    age_range: [38, 58],
    weight: 3,
    cooldown_years: 3,
    max_fires: 1,
    prerequisites: {
      career_path: PATH.INTERNATIONAL
    },
    choices: [
      {
        label: "Keep her, and buy her shifts on an operating machine abroad",
        stat_check: {
          stats: ["CO", "CH"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "You spend your standing to put her on somebody else's tokamak for two campaigns. She defends on real data and integration work, and the consortium hires her the week she finishes.",
            stat_deltas: {
              CO: 0.5,
              CH: 0.3
            },
            stress_delta: STRESS.MENTORING,
            reputation_deltas: {
              NET: 4,
              SCI: 2
            },
            relationship_deltas: {
              npc_agarwal: RELD.HELPED
            },
            flags_set: ["got_her_beam_time"]
          },
          failure: {
            text: "The shifts fall through twice, once on visa timing and once on their run schedule. She writes the simulation thesis, defends it well, and takes a job with a company that will let her touch hardware this decade.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {
              NET: 1
            },
            relationship_deltas: {},
            flags_set: []
          }
        }
      },
      {
        label: "Send her to a group with a machine that runs on Tuesdays",
        outcomes: {
          success: {
            text: "You spend an hour talking the best candidate you have seen in five years out of your own project. She takes the advice and thanks you for it. Your task list is unchanged and now has nobody on it.",
            stat_deltas: {
              CH: 0.2
            },
            stress_delta: STRESS.RELATIONSHIP_POSITIVE,
            reputation_deltas: {
              NET: -2,
              SCI: -1
            },
            relationship_deltas: {
              npc_agarwal: RELD.HELPED
            },
            flags_set: ["sent_her_elsewhere"]
          }
        }
      }
    ]
  },
  {
    id: "pin_eighteen_months_wall",
    title: "Eighteen months to choose a wall",
    text: "Beryllium or tungsten for the first wall. Four working groups, two review panels, a physics case that shifted twice while the panels sat, and a decision that will be taken in a room you are not in.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.MID_CAREER, STAGE.SENIOR],
    age_range: [42, 63],
    weight: 3,
    cooldown_years: 5,
    max_fires: 1,
    prerequisites: {
      career_path: PATH.INTERNATIONAL
    },
    choices: [
      {
        label: "Write the technical basis and let it carry itself",
        stat_check: {
          stats: ["SM", "IN"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "Ninety pages, no advocacy, every uncertainty stated where it lives. The room takes fourteen months to arrive where the document already was, and the two members who disagreed with it cite it in their own submissions.",
            stat_deltas: {
              SM: 0.5,
              IN: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 6
            },
            relationship_deltas: {
              npc_iwasaki: RELD.COLLABORATED
            },
            flags_set: ["wrote_the_technical_basis"]
          },
          failure: {
            text: "It is the best thing you have written and nine people read it. The decision goes the other way for reasons that are in nobody's minutes, and you learn the outcome from a press release.",
            stat_deltas: {
              GR: 0.4
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              SCI: 2,
              NET: -1
            },
            relationship_deltas: {},
            flags_set: []
          }
        }
      },
      {
        label: "Work the delegations one at a time",
        stat_check: {
          stats: ["CH", "CO"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "Eighteen months of dinners, drafts and pre-meetings in four countries. The decision comes out the way the physics said it should, and no part of that is written down anywhere with your name on it.",
            stat_deltas: {
              CH: 0.5,
              CO: 0.6
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              NET: 6
            },
            relationship_deltas: {
              npc_mbeki: RELD.COLLABORATED
            },
            flags_set: ["worked_the_delegations"]
          },
          failure: {
            text: "You spend eighteen months in the corridor and are read, correctly, as lobbying. The decision is deferred another year and two delegations route around you afterwards.",
            stat_deltas: {
              GR: 0.4
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              NET: -4
            },
            relationship_deltas: {
              npc_mbeki: RELD.DISAGREED
            },
            flags_set: []
          }
        }
      },
      {
        label: "Stay out of it and deliver your own package",
        outcomes: {
          success: {
            text: "You let the wall decide itself and put the eighteen months into the diagnostic you are actually responsible for. It arrives on time, which is rare enough that people mention it, and when the decision lands you read it like everybody else.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              NET: -3
            },
            relationship_deltas: {},
            flags_set: ["stayed_out_of_the_wall"]
          }
        }
      }
    ]
  },
  {
    id: "pin_council_slide",
    title: "One slide for the council",
    text: "The council meets in two weeks and you have one slide on assembly. The float in it is eleven months of optimism that four separate suppliers would each have to be lucky to deliver.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.SENIOR],
    age_range: [50, 65],
    weight: 4,
    cooldown_years: 5,
    max_fires: 1,
    prerequisites: {
      career_path: PATH.INTERNATIONAL
    },
    choices: [
      {
        label: "Show the schedule with the float taken out",
        stat_check: {
          stats: ["GR", "CH"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "The number on the screen is three years worse than the number the members have been giving their parliaments. There is a very long silence, and then two years of rebaselining that everyone privately knew was coming. You are the one who said it first.",
            stat_deltas: {
              GR: 0.6,
              CH: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 6,
              PUB: -2,
              NET: 2
            },
            relationship_deltas: {
              npc_mbeki: RELD.COLLABORATED
            },
            flags_set: ["told_the_council"]
          },
          failure: {
            text: "You say it plainly and two delegations spend the afternoon establishing that your assumptions are pessimistic. The schedule stands unchanged, and at the next reorganisation you are no longer on the assembly review.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              NET: -4,
              SCI: 2
            },
            relationship_deltas: {},
            flags_set: ["told_the_council"]
          }
        }
      },
      {
        label: "Brief the members privately before the meeting",
        stat_check: {
          stats: ["CO", "CH"],
          modifier: 0.1
        },
        outcomes: {
          success: {
            text: "Six calls in eight days. By the time the slide goes up, three delegations have their line ready and the schedule is discussed rather than defended. Nothing about the physics changes and everything about the meeting does.",
            stat_deltas: {
              CO: 0.6,
              CH: 0.4
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              NET: 5,
              SCI: 2
            },
            relationship_deltas: {
              npc_mbeki: RELD.COLLABORATED
            },
            flags_set: ["pre_briefed_the_council"]
          },
          failure: {
            text: "One of the six calls is repeated in the wrong room. You arrive at a meeting that has become a question of who briefed whom, and the eleven months are never discussed at all.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              NET: -3
            },
            relationship_deltas: {
              npc_mbeki: RELD.DISAGREED
            },
            flags_set: []
          }
        }
      },
      {
        label: "Show the approved schedule and put the risk in the annex",
        outcomes: {
          success: {
            text: "The slide is green. Annex page forty-one says, in a sentence nobody reads aloud, that eleven months depend on four suppliers performing simultaneously. The meeting ends early, the funding cycle closes clean, and the date slips anyway, later, on somebody else's slide.",
            stat_deltas: {
              CO: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: -3
            },
            relationship_deltas: {},
            flags_set: ["kept_the_slide_green"]
          }
        }
      }
    ]
  },
  {
    id: "pin_staff_contract",
    title: "Seconded or staff",
    text: "Your secondment ends in March. The organisation will take you as staff on five years, which means resigning the post your home institute has held open for eleven of them.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.MID_CAREER, STAGE.SENIOR],
    age_range: [40, 60],
    weight: 3,
    cooldown_years: 5,
    max_fires: 1,
    prerequisites: {
      career_path: PATH.INTERNATIONAL
    },
    choices: [
      {
        label: "Resign the home post and sign the five years",
        stat_check: {
          stats: ["GR", "CO"],
          modifier: 0.1
        },
        outcomes: {
          success: {
            text: "You give up the return ticket and get the job you have actually been doing for four years. Renewable at the pleasure of a council, and for the first time your title matches your task list.",
            stat_deltas: {
              GR: 0.5,
              CO: 0.5
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              NET: 5,
              SCI: 2
            },
            relationship_deltas: {
              npc_mbeki: RELD.CHOSE_THEM
            },
            flags_set: ["went_staff"]
          },
          failure: {
            text: "You sign, and the reorganisation eighteen months later puts your section under someone with a different plan for it. There is no post to go back to and three years left on the contract.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              NET: 1
            },
            relationship_deltas: {},
            flags_set: ["went_staff", "stranded_abroad"]
          }
        }
      },
      {
        label: "Go home when the secondment ends",
        outcomes: {
          success: {
            text: "You hand over four years of interface work in six weeks of meetings and fly home to a department that has moved on without you. What you built is in the machine and your name is on none of the parts. Your children finish school in one country.",
            stat_deltas: {
              GR: 0.2
            },
            stress_delta: STRESS.REST,
            reputation_deltas: {
              NET: -4,
              SCI: -1
            },
            relationship_deltas: {},
            flags_set: ["went_home"]
          }
        }
      }
    ]
  },
  {
    id: "pin_machine_in_your_lifetime",
    title: "A machine that runs in six years",
    text: "Iwasaki is standing up a national device that will take shots in six years. You are eleven years into a machine whose first campaign is scheduled after your sixty fifth birthday.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.SENIOR],
    age_range: [52, 64],
    weight: 3,
    cooldown_years: 5,
    max_fires: 1,
    prerequisites: {
      career_path: PATH.INTERNATIONAL
    },
    choices: [
      {
        label: "Go, and take four of your people with you",
        stat_check: {
          stats: ["CO", "IN"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "The smaller machine runs on schedule and you spend your last decade taking data instead of minutes. The consortium replaces the four people in fourteen months and the interface knowledge rather more slowly than that.",
            stat_deltas: {
              IN: 0.5,
              CO: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: 5,
              NET: -3
            },
            relationship_deltas: {
              npc_iwasaki: RELD.CHOSE_THEM,
              npc_mbeki: RELD.DISAGREED
            },
            flags_set: ["left_the_consortium"]
          },
          failure: {
            text: "The national programme is rescoped in its second year and the device that was going to run in six is a design study again. You are sixty, off the big machine, and on neither.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              SCI: -2,
              NET: -3
            },
            relationship_deltas: {
              npc_mbeki: RELD.DISAGREED
            },
            flags_set: ["left_the_consortium"]
          }
        }
      },
      {
        label: "Stay for a campaign you will not see the end of",
        stat_check: {
          stats: ["GR", "CH"],
          modifier: 0.1
        },
        outcomes: {
          success: {
            text: "You hand the divertor package over complete, documented in two languages, to a woman who was eight years old when the site was cleared. First plasma stays a date on a wall chart, and your name is in the acknowledgements of a machine that will outlast you.",
            stat_deltas: {
              GR: 0.6,
              CH: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 4,
              NET: 5
            },
            relationship_deltas: {
              npc_agarwal: RELD.HELPED
            },
            flags_set: ["stayed_to_the_end"]
          },
          failure: {
            text: "You stay, and the handover goes to a contractor on a two year rotation who reads the documents once. You retire from a machine that has slipped again, carrying eleven years of knowledge nobody has scheduled a meeting to collect.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              NET: 2
            },
            relationship_deltas: {},
            flags_set: ["stayed_to_the_end"]
          }
        }
      }
    ]
  },
];
