// Further undergraduate and doctoral events, widening the two thinnest stages.
// Safe (roll-free) choices forfeit reputation and buy back stress, which feeds
// the success threshold, so caution is a real strategy rather than a trap.
import { EVENT_TYPE } from '../engine/events.js';
import { STAGE } from '../engine/stages.js';
import { STRESS } from '../engine/stress.js';
import { REL as RELD } from '../engine/relationships.js';

export const SCHOOL_EVENTS_2 = [
  {
    id: "c2_demonstrator_marking",
    title: "Forty reports by Friday",
    text: "The department pays undergraduate demonstrators by the hour to run the Wednesday first-year lab. Two hours on the floor, forty write-ups to mark by Friday, and the marking is the part nobody mentioned.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.COLLEGE],
    age_range: [20, 23],
    weight: 3,
    cooldown_years: 3,
    max_fires: 2,
    choices: [
      {
        label: "Mark them properly, with comments",
        stat_check: {
          stats: ["SM", "GR"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "You write real comments on every one, which takes six hours instead of two. Explaining error propagation forty times in a row is the first time you have understood it well enough to be bored by it.",
            stat_deltas: {
              SM: 0.5,
              CH: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              NET: 1
            },
            relationship_deltas: {},
            flags_set: ["demonstrated_labs", "taught_to_learn"]
          },
          failure: {
            text: "You are two weeks behind by half term. The coordinator gets three complaints about turnaround and moves you to the session that only needs a body on the floor. The pay is the same.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              NET: -1
            },
            relationship_deltas: {},
            flags_set: ["demonstrated_labs"]
          }
        }
      },
      {
        label: "Mark to the rubric and get out",
        outcomes: {
          success: {
            text: "Ticks, a number, and nothing in the margin. Ninety minutes a week and the money is identical. One of the first years asks you in March what she did wrong in November and you have no memory of her report at all.",
            stat_deltas: {
              CH: -0.3
            },
            stress_delta: STRESS.REST,
            reputation_deltas: {
              NET: -1
            },
            relationship_deltas: {},
            flags_set: ["demonstrated_labs", "marked_to_rubric"]
          }
        }
      }
    ]
  },
  {
    id: "c2_franck_hertz",
    title: "Four point nine",
    text: "The Franck-Hertz tube should give peaks spaced by 4.9 volts. Yours are spaced by 5.3, consistently, all afternoon. The demonstrator has gone to another bench and the report is due Thursday.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.COLLEGE],
    age_range: [18, 21],
    weight: 3,
    cooldown_years: 3,
    max_fires: 1,
    choices: [
      {
        label: "Write up 5.3 and defend it",
        stat_check: {
          stats: ["SM", "IN"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "You report what you measured, with an error budget and two candidate explanations, one of which is the tube. The marker writes in the margin: this is what a lab report is for. It is the highest mark you get all year.",
            stat_deltas: {
              SM: 0.5,
              IN: 0.5
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["honest_operator", "reported_what_i_measured"]
          },
          failure: {
            text: "The marker reads an eight percent discrepancy as carelessness and writes check your peak positions. You were not careless. There is nowhere to say so that would not sound like a student arguing about a mark.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["honest_operator"]
          }
        }
      },
      {
        label: "Stay and run it again with the demonstrator",
        stat_check: {
          stats: ["GR", "CH"],
          modifier: -0.05
        },
        outcomes: {
          success: {
            text: "He checks the oven and finds it sitting twenty degrees under setpoint, which thins the mercury vapour and lets electrons run further between collisions. Reheated, the spacing comes back to 4.9. You leave at nine knowing something the rest of the group does not.",
            stat_deltas: {
              IN: 0.5,
              GR: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["found_the_fault"]
          },
          failure: {
            text: "He gives you twenty minutes, changes nothing, and says the tube is old. You stay until the building closes and get 5.3 again. The report goes in a day late for a capped mark and is, as far as you can tell, correct.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: []
          }
        }
      },
      {
        label: "Shift the peaks onto 4.9",
        outcomes: {
          success: {
            text: "Two of the readings move by a few tenths and the graph agrees with the textbook. Full marks, and the evening back, and a Thursday where you sleep. You could not now say what the tube was actually doing that afternoon.",
            stat_deltas: {
              SM: -0.3,
              IN: -0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["fudged_lab_data"]
          }
        }
      }
    ]
  },
  {
    id: "c2_spreadsheet_summer",
    title: "Column D",
    text: "The summer placement pays well and turned out to be a spreadsheet. You are reconciling procurement dates for a heat exchanger contract. Nobody on the floor has opened a physics book in fifteen years and the coffee is free.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.COLLEGE],
    age_range: [19, 23],
    weight: 3,
    cooldown_years: 3,
    max_fires: 1,
    choices: [
      {
        label: "Do it well and ask what is underneath it",
        stat_check: {
          stats: ["CH"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "A process engineer takes forty minutes to show you why the exchanger was derated for fouling, and then why the derating was argued about for eleven months. You finish the summer understanding how anything large actually gets bought, which almost nobody in your year does.",
            stat_deltas: {
              SM: 0.3,
              CO: 0.5
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              NET: 1
            },
            relationship_deltas: {},
            flags_set: ["industry_summer", "learned_procurement"]
          },
          failure: {
            text: "Everyone is polite and everyone is busy. You finish the spreadsheet, learn what a Gantt chart is, and go back in October with a reference that says reliable and a summer you cannot describe in a sentence.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["industry_summer"]
          }
        }
      },
      {
        label: "Automate the whole thing in the first fortnight",
        stat_check: {
          stats: ["SM", "IN"],
          modifier: -0.05
        },
        outcomes: {
          success: {
            text: "Two hundred lines do ten weeks of it in an afternoon. Nobody quite knows what to do with you afterwards, so you spend six weeks reading the standards the contract is written against, which is the most useful thing that happens to you all year.",
            stat_deltas: {
              SM: 0.5,
              IN: 0.5
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              NET: 2
            },
            relationship_deltas: {},
            flags_set: ["industry_summer", "writes_tools"]
          },
          failure: {
            text: "Your date parsing reads the American format for three hundred rows and the error reaches a supplier before anyone catches it. You spend three weeks checking the sheet by hand, in front of the man who found it.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              NET: -1
            },
            relationship_deltas: {},
            flags_set: ["industry_summer"]
          }
        }
      },
      {
        label: "Leave at the end of week six",
        outcomes: {
          success: {
            text: "You give a reason about coursework that is true and not the reason. July is yours and you read four books in it. The line on your record is now six weeks long and someone will eventually ask about it.",
            stat_deltas: {
              CO: -0.3
            },
            stress_delta: STRESS.REST,
            reputation_deltas: {
              NET: -1
            },
            relationship_deltas: {},
            flags_set: ["left_placement_early"]
          }
        }
      }
    ]
  },
  {
    id: "c2_society_badly",
    title: "President, physics society",
    text: "You stood unopposed. Since then: two speakers cancelled, a treasurer who has stopped answering, and an email from the union about a float of four hundred that nobody has reconciled since October.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.COLLEGE],
    age_range: [19, 23],
    weight: 3,
    cooldown_years: 4,
    max_fires: 1,
    choices: [
      {
        label: "Fix all of it yourself, evening by evening",
        stat_check: {
          stats: ["GR"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "Six weeks of receipts. The accounts close to the penny and you book a lab scientist who fills the lecture theatre. Nobody notices any of it, which is the correct outcome for society administration and still lands oddly.",
            stat_deltas: {
              GR: 0.5,
              CO: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              NET: 2
            },
            relationship_deltas: {},
            flags_set: ["ran_the_society"]
          },
          failure: {
            text: "You close the accounts in week nine and hand in a lab report four days late for it. The union writes to say the matter is resolved. That is the whole of what the term produced.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["ran_the_society"]
          }
        }
      },
      {
        label: "Delegate hard and let it look bad for a month",
        stat_check: {
          stats: ["CH", "CO"],
          modifier: -0.05
        },
        outcomes: {
          success: {
            text: "You split it four ways and ask people directly, which you have never done. Two of them turn out to be better at this than you. By March you are chairing rather than doing, and the difference is enormous.",
            stat_deltas: {
              CH: 0.5,
              CO: 0.5
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              NET: 3
            },
            relationship_deltas: {
              npc_varga: RELD.COLLABORATED
            },
            flags_set: ["ran_the_society", "learned_to_delegate"]
          },
          failure: {
            text: "Two of the four do nothing and do not say so. A speaker who drove ninety minutes waits in the wrong building for twenty of them. You apologise by email and he replies, kindly, that it happens.",
            stat_deltas: {
              CH: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              NET: -1
            },
            relationship_deltas: {},
            flags_set: ["ran_the_society"]
          }
        }
      },
      {
        label: "Resign the presidency",
        outcomes: {
          success: {
            text: "The vice president takes it over and has it running better inside a month, which is a relief and also information. You get your Tuesdays and your evenings and you stop being the person anyone emails.",
            stat_deltas: {
              CH: -0.3,
              CO: -0.3
            },
            stress_delta: STRESS.REST,
            reputation_deltas: {
              NET: -2
            },
            relationship_deltas: {},
            flags_set: ["resigned_the_society"]
          }
        }
      }
    ]
  },
  {
    id: "c2_friend_drops_out",
    title: "Not coming back after Christmas",
    text: "Danny has failed the same two modules twice. He has told his parents and not the department, and he has asked you not to say anything. Resit registration closes in three weeks.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.COLLEGE],
    age_range: [18, 22],
    weight: 3,
    cooldown_years: 4,
    max_fires: 1,
    choices: [
      {
        label: "Sit down and do the registration with him",
        stat_check: {
          stats: ["CH", "GR"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "You take four evenings and the form. He resits one, fails the other, and transfers to a course he is better at and visibly happier in. He is at your wedding. He never once mentions the four evenings.",
            stat_deltas: {
              CH: 0.5,
              GR: 0.3
            },
            stress_delta: STRESS.RELATIONSHIP_POSITIVE,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["stood_by_a_friend"]
          },
          failure: {
            text: "He registers, thanks you, and does not turn up to the exam. He stops replying in February. You find out in March, from somebody else, that he had left in January and had not been in the city since.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.LIFE_EVENT,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["friend_left"]
          }
        }
      },
      {
        label: "Tell his personal tutor",
        stat_check: {
          stats: ["CH"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "The tutor already knew most of it and had a route that Danny had not been told about. He is furious with you for a term. He writes to you about it nine years later and the letter is not what you expected.",
            stat_deltas: {
              CH: 0.3,
              GR: 0.3
            },
            stress_delta: STRESS.RELATIONSHIP_CONFLICT,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["told_the_tutor"]
          },
          failure: {
            text: "The tutor does the correct procedural thing, which is a letter on headed paper. Danny reads it as something you did to him rather than for him, and he is not entirely wrong, and you do not speak again.",
            stat_deltas: {},
            stress_delta: STRESS.LIFE_EVENT,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["friend_left"]
          }
        }
      },
      {
        label: "Say nothing. It is his to decide.",
        outcomes: {
          success: {
            text: "You keep your term and he keeps his privacy. He goes in January and sends one message in July saying he is fine. You never establish whether that was true, and you did get the term back.",
            stat_deltas: {
              CH: -0.3
            },
            stress_delta: STRESS.REST,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["friend_left", "said_nothing"]
          }
        }
      }
    ]
  },
  {
    id: "c2_the_median",
    title: "One column right of the middle",
    text: "You were the one your school sent to competitions. The first-year mechanics results go up as a distribution with your candidate number in it, just right of the middle, and everyone in that column was also the one their school sent.",
    type: EVENT_TYPE.RANDOM,
    stage: [STAGE.COLLEGE],
    age_range: [18, 20],
    weight: 3,
    cooldown_years: 3,
    max_fires: 1,
    choices: [
      {
        label: "Work out precisely what you are slow at",
        stat_check: {
          stats: ["SM", "IN"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "It is not the physics. It is that you were never made to write down what you were doing, so you lose method marks on questions you can see the answer to. You start showing every line and the marks move a full band in two terms.",
            stat_deltas: {
              SM: 0.5,
              IN: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["diagnosed_myself"]
          },
          failure: {
            text: "You spend five weeks auditing your own scripts instead of doing problems, which is a comfortable way to feel busy. The next set of results comes out in the same column.",
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
        label: "Stop reading the board",
        outcomes: {
          success: {
            text: "You take the distribution as weather rather than a verdict, which is mostly the healthier reading. Your marks sit in the same place for two years and you are calmer and no better.",
            stat_deltas: {
              SM: -0.3
            },
            stress_delta: STRESS.REST,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["stopped_competing"]
          }
        }
      }
    ]
  },
  {
    id: "c2_bessel_week",
    title: "Bessel functions, second week",
    text: "Mathematical methods has been a term of formal manipulation with nothing under it. Then the cylindrical case goes on the board, and the same functions that fell out of the vibrating drum fall out of the force-free field in the paper you have been failing to read since October.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.COLLEGE],
    age_range: [18, 22],
    weight: 3,
    cooldown_years: 3,
    max_fires: 1,
    choices: [
      {
        label: "Rewrite the year's notes from the first lecture",
        stat_check: {
          stats: ["GR", "SM"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "Three weekends and a hand cramp. You end with sixty pages in which every substitution has a reason, and you are still consulting them at thirty four, in a different country, about a different machine.",
            stat_deltas: {
              SM: 0.8,
              GR: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["maths_clicked", "rewrote_the_notes"]
          },
          failure: {
            text: "You get as far as the October material before term overtakes it and the rest stays as it was. The half you redid is the half you will always be better at, which you notice for the next fifteen years.",
            stat_deltas: {
              SM: 0.3,
              GR: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["maths_clicked"]
          }
        }
      },
      {
        label: "Take the reading further than the module goes",
        stat_check: {
          stats: ["IN", "SM"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "You work the screw pinch equilibrium through yourself, get a factor of two wrong twice, and find it on the third pass. The question you finally email the lecturer is a real question and she answers it as one.",
            stat_deltas: {
              IN: 0.8,
              SM: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 1
            },
            relationship_deltas: {
              npc_okafor: RELD.SPOKE_WELL
            },
            flags_set: ["maths_clicked", "read_ahead"]
          },
          failure: {
            text: "Six weeks out of your depth and two problem sets handed in late. You keep one page of the derivation that is correct and cannot reconstruct how you got it. It stays in the folder anyway.",
            stat_deltas: {
              IN: 0.3,
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["maths_clicked"]
          }
        }
      }
    ]
  },
  {
    id: "c2_not_quite_reportable",
    title: "Not quite reportable",
    text: "Rowe runs the third-year tutorial. He does not shout. He reads your solution out, pauses in the wrong place, and asks whether anyone would care to defend it. Two people have stopped coming and neither has said why.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.COLLEGE],
    age_range: [20, 23],
    weight: 3,
    cooldown_years: 4,
    max_fires: 1,
    choices: [
      {
        label: "Raise it with your personal tutor",
        stat_check: {
          stats: ["CH"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "She listens, tells you plainly that nothing formal will happen, and then the tutorial groups are quietly reshuffled at half term for reasons given as timetabling. Rowe never learns why. You learn how most of this actually gets fixed.",
            stat_deltas: {
              CH: 0.5,
              CO: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              NET: 1
            },
            relationship_deltas: {},
            flags_set: ["raised_it"]
          },
          failure: {
            text: "It is a style, she says, not a problem, and mentions it to him as a courtesy. The pauses get a little longer for the rest of the term and are never once aimed at anything you could quote.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.RELATIONSHIP_CONFLICT,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["raised_it", "froze_once"]
          }
        }
      },
      {
        label: "Turn up over-prepared every week",
        stat_check: {
          stats: ["SM", "GR"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "By week seven he has nothing left to pause at and starts treating you, unbearably, as an ally against the others. You come out of it knowing more electromagnetism than the syllabus asks for and something about people that you did not want.",
            stat_deltas: {
              SM: 0.8,
              GR: 0.5
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 1
            },
            relationship_deltas: {},
            flags_set: ["out_prepared_him"]
          },
          failure: {
            text: "He finds something anyway, every week, because finding something is the point. You learn the material and you stop putting your hand up in any room at all for about two years.",
            stat_deltas: {
              SM: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["froze_once"]
          }
        }
      },
      {
        label: "Stop going and read it alone",
        outcomes: {
          success: {
            text: "You sign in for two of the remaining eight and take the textbook to the library instead. Your exam mark is a point or two below where it would have been and your term is survivable. The two who left did the same thing, and none of you ever discussed it.",
            stat_deltas: {
              CH: -0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              NET: -1
            },
            relationship_deltas: {},
            flags_set: ["self_taught_start", "stopped_attending"]
          }
        }
      }
    ]
  },
  {
    id: "c2_three_shifts",
    title: "Thursday, Friday, Sunday",
    text: "Your rent went up in September and the loan did not. The campus bar wants three shifts, which are Thursday's problem class and both of the days you used to do the reading.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.COLLEGE],
    age_range: [18, 23],
    weight: 3,
    cooldown_years: 2,
    max_fires: 2,
    choices: [
      {
        label: "Take all three shifts",
        stat_check: {
          stats: ["GR"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "You are tired for a year and never short. You also serve two hundred strangers a week, and by June you can hold a conversation with anybody in any room, which no transcript records.",
            stat_deltas: {
              GR: 0.5,
              CH: 0.5
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["money_ok", "worked_through_college"]
          },
          failure: {
            text: "The marks slip by a band and you do not notice until the results in June, because the money was arriving on time and that felt like the thing being measured. The summer goes on catching up.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["money_ok", "fell_behind"]
          }
        }
      },
      {
        label: "One shift, and ask the department about hardship funding",
        stat_check: {
          stats: ["CH", "CO"],
          modifier: -0.05
        },
        outcomes: {
          success: {
            text: "The form is four pages and the fund covers a term. You keep Thursdays. The administrator who processes it tells you, without looking up, that eleven people a year ask and about forty should.",
            stat_deltas: {
              CO: 0.5,
              SM: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["money_ok", "asked_for_help"]
          },
          failure: {
            text: "Six weeks of processing and a refusal, because your household is a few hundred over a threshold set in 2009. You take the other two shifts in November, already behind, and do not mention the form to anyone.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["money_tight"]
          }
        }
      },
      {
        label: "Move further out where the rent is cheaper",
        outcomes: {
          success: {
            text: "Forty minutes each way on a bus that stops running at eleven. You are solvent and rested and you are no longer in the building at the hours when things get decided, which is most of what the building is for.",
            stat_deltas: {
              CO: -0.5
            },
            stress_delta: STRESS.REST,
            reputation_deltas: {
              NET: -1
            },
            relationship_deltas: {},
            flags_set: ["money_ok", "moved_out_of_town"]
          }
        }
      }
    ]
  },
  {
    id: "c2_fourth_on_the_list",
    title: "Fourth on the list",
    text: "Final-year projects go by a form with five ranked choices. You get the fourth: characterising a Langmuir probe circuit for the teaching lab. Both plasma projects went to people with better second-year marks.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.COLLEGE],
    age_range: [20, 24],
    weight: 3,
    cooldown_years: 3,
    max_fires: 1,
    choices: [
      {
        label: "Do the probe properly",
        stat_check: {
          stats: ["SM", "GR"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "You spend seven months on sheaths, floating potential and the exponential region of an I-V curve, and end the year understanding a real diagnostic from the electronics up. Nobody who got the interesting project can say the same about anything.",
            stat_deltas: {
              SM: 0.5,
              IN: 0.5
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 2
            },
            relationship_deltas: {},
            flags_set: ["knows_probes", "did_the_dull_project_well"]
          },
          failure: {
            text: "The circuit works by March and the write-up is thin, because there was only ever so much to say. You get a good mark and nothing you would show anybody, which is the ordinary outcome of an ordinary project.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["knows_probes"]
          }
        }
      },
      {
        label: "Ask to be swapped onto a plasma project",
        stat_check: {
          stats: ["CH", "CO"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "He takes you as a second student because his first has gone quiet since October. You get the topic you wanted and no machine time until March, which turns two terms of work into one.",
            stat_deltas: {
              CH: 0.5,
              CO: 0.5
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 1
            },
            relationship_deltas: {
              npc_okafor: RELD.CHOSE_THEM
            },
            flags_set: ["got_the_project"]
          },
          failure: {
            text: "He is polite and the answer is no, the allocation is the allocation. You do the probe project starting two weeks later than everyone else, and the coordinator now knows your name as the one who asked.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {
              NET: -1
            },
            relationship_deltas: {},
            flags_set: ["knows_probes"]
          }
        }
      }
    ]
  },
  {
    id: "c2_the_folder",
    title: "The folder",
    text: "Somebody two years above kept worked solutions to six years of papers, including the two years the same lecturer has been recycling questions from. The link is in the cohort group chat by Tuesday lunchtime.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.COLLEGE],
    age_range: [18, 23],
    weight: 3,
    cooldown_years: 2,
    max_fires: 2,
    choices: [
      {
        label: "Use it, but attempt every question before you look",
        stat_check: {
          stats: ["GR", "SM"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "Six years of papers, worked cold and then checked. It is the best revision you have ever done and it takes three times as long as anyone else's. Two questions in the exam are old friends and you would have got them anyway.",
            stat_deltas: {
              SM: 0.5,
              GR: 0.5
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["revised_properly"]
          },
          failure: {
            text: "You run out of April and spend the last week reading solutions to questions you never attempted, which feels identical to learning and is not. One recycled question comes up. The rest goes as it would have.",
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
        label: "Do not open it",
        stat_check: {
          stats: ["GR", "IN"],
          modifier: -0.05
        },
        outcomes: {
          success: {
            text: "You revise from lectures and the textbook and sit the paper next to people who visibly recognise two questions. Your mark is a little lower than theirs and entirely yours, and you are the only one who will ever care about that distinction.",
            stat_deltas: {
              GR: 0.5,
              IN: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["honest_operator"]
          },
          failure: {
            text: "You revise the whole syllabus evenly, which is the least efficient strategy available against a paper this predictable. You come out four or five marks below people who worked less and you know exactly why.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["honest_operator"]
          }
        }
      },
      {
        label: "Learn the recycled questions and skip the rest",
        outcomes: {
          success: {
            text: "Six questions cold, a third of the syllabus untouched, and eleven evenings back. It is the best mark of your degree and you could not sit the same paper in September. Half the cohort did the same and the distribution that year is quietly strange.",
            stat_deltas: {
              SM: -0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["used_the_folder"]
          }
        }
      }
    ]
  },
  {
    id: "c2_torus_hall",
    title: "The minibus to the torus hall",
    text: "The society trip: two hours each way, a safety briefing, and forty minutes on a gantry above a spherical tokamak with the vessel open for maintenance. It is smaller than the photographs and entirely covered in cables.",
    type: EVENT_TYPE.RANDOM,
    stage: [STAGE.COLLEGE],
    age_range: [18, 23],
    weight: 2,
    cooldown_years: 3,
    max_fires: 1,
    choices: [
      {
        label: "Spend the whole forty minutes on the operations engineer",
        stat_check: {
          stats: ["CH"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "He opens a laptop on the gantry rail and walks you through a disruption from the previous week, then explains why vertical stability control keeps him awake and the neutron yield never does. He answers your email in August.",
            stat_deltas: {
              CH: 0.5,
              CO: 0.5,
              IN: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              NET: 2
            },
            relationship_deltas: {},
            flags_set: ["saw_a_machine", "first_contact_in_the_field"]
          },
          failure: {
            text: "He answers three questions properly and then the next group arrives and he is theirs. You write down everything you saw on the drive back, before it goes, and most of it survives.",
            stat_deltas: {
              IN: 0.3,
              GR: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["saw_a_machine"]
          }
        }
      },
      {
        label: "Take the day as a day out",
        outcomes: {
          success: {
            text: "You stay with the group, ask nothing, sleep for an hour of the drive home, and remember the smell of the hall for thirty years. Nothing measurable happens and you would not give the day back.",
            stat_deltas: {
              CO: -0.3
            },
            stress_delta: STRESS.REST,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["saw_a_machine"]
          }
        }
      }
    ]
  },
  {
    id: "c2_nine_hundred_lines",
    title: "The script only you can run",
    text: "Your project analysis is nine hundred lines in one file with the data path hard-coded twice. It works. The demonstrator asks, mildly, what happens when the sampling rate changes.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.COLLEGE],
    age_range: [20, 24],
    weight: 3,
    cooldown_years: 3,
    max_fires: 1,
    choices: [
      {
        label: "Rewrite it: functions, version control, a test on the known case",
        stat_check: {
          stats: ["SM", "GR"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "Four days you did not have. Afterwards the whole analysis reruns in ninety seconds, so you rerun it three times before submission, and the third run is the one that finds the sign error.",
            stat_deltas: {
              SM: 0.5,
              GR: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 1
            },
            relationship_deltas: {},
            flags_set: ["writes_tools", "code_hygiene"]
          },
          failure: {
            text: "The rewrite is two thirds done at the deadline, so you run the old file and hand in numbers you can no longer reproduce exactly. Nobody asks. You know.",
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
        label: "Ask the PhD student who wrote the group's version",
        stat_check: {
          stats: ["CH", "CO"],
          modifier: -0.05
        },
        outcomes: {
          success: {
            text: "She gives you her code, an hour of her time and a warning about the calibration file that saves you a fortnight. Your results are hers with one figure added, and you say so in the acknowledgements.",
            stat_deltas: {
              CO: 0.5,
              CH: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              NET: 2
            },
            relationship_deltas: {
              npc_haddad: RELD.COLLABORATED
            },
            flags_set: ["borrowed_the_code"]
          },
          failure: {
            text: "She is in the third year of a doctorate and says she will send it that evening, and means it, and does not. You wait ten days being polite about it before starting again yourself.",
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
        label: "Leave it running and write a page explaining it",
        outcomes: {
          success: {
            text: "One page of notes and no further edits. It carries the project fine and dies with the laptop. Three years later you rewrite the same analysis from nothing, because there is nothing to recover.",
            stat_deltas: {
              SM: -0.3
            },
            stress_delta: STRESS.REST,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["no_code_hygiene"]
          }
        }
      }
    ]
  },
  {
    id: "c2_peer_mentoring",
    title: "The one you are meant to be helping",
    text: "The peer mentoring scheme pairs you with a first year. Four weeks in she is finishing the problems faster than you and asking about the steps you have been skipping since October.",
    type: EVENT_TYPE.RANDOM,
    stage: [STAGE.COLLEGE],
    age_range: [19, 23],
    weight: 2,
    cooldown_years: 3,
    max_fires: 1,
    choices: [
      {
        label: "Keep the sessions and let her set the pace",
        stat_check: {
          stats: ["CH", "GR"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "You spend a term relearning the things you had been getting away with, out loud, in front of someone eighteen years old. She still introduces you as her mentor in her final year and you have never worked out how to accept it.",
            stat_deltas: {
              SM: 0.5,
              CH: 0.5
            },
            stress_delta: STRESS.MENTORING,
            reputation_deltas: {
              NET: 2
            },
            relationship_deltas: {},
            flags_set: ["mentored_someone", "taught_to_learn"]
          },
          failure: {
            text: "You keep up for three weeks and then start moving the meetings. She is gracious about the third cancellation, finds a fourth year who has the time, and remains friendly whenever you pass in the corridor.",
            stat_deltas: {
              CH: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: []
          }
        }
      },
      {
        label: "Keep the slot and stop preparing for it",
        outcomes: {
          success: {
            text: "Six weeks of turning up cold and letting her explain her own work to you, which she does well enough that neither of you names what is happening. The hour is easy and the line stays on your record.",
            stat_deltas: {
              CH: -0.3
            },
            stress_delta: STRESS.REST,
            reputation_deltas: {
              NET: -1
            },
            relationship_deltas: {},
            flags_set: ["coasted_mentoring"]
          }
        }
      }
    ]
  },
  {
    id: "c2_departmental_prize",
    title: "Four marks",
    text: "One prize a year, a small cheque and a line on your record. It goes to Varga by four marks in a year when you worked harder than she did. The list is pinned in the corridor everyone walks down at lunchtime.",
    type: EVENT_TYPE.RANDOM,
    stage: [STAGE.COLLEGE],
    age_range: [19, 23],
    weight: 2,
    cooldown_years: 3,
    max_fires: 1,
    choices: [
      {
        label: "Congratulate her and mean it",
        stat_check: {
          stats: ["CH"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "You buy the coffee and she shows you her script without being asked. Twenty minutes of watching how she sets a problem up teaches you more than the module did, and she does not once mention the four marks.",
            stat_deltas: {
              CH: 0.5,
              SM: 0.3
            },
            stress_delta: STRESS.RELATIONSHIP_POSITIVE,
            reputation_deltas: {
              NET: 1
            },
            relationship_deltas: {
              npc_varga: RELD.COMPETED_LOST
            },
            flags_set: ["lost_well"]
          },
          failure: {
            text: "It comes out flat and she hears the effort in it. You are perfectly fine with each other for the rest of the year, in the way that means slightly formal, and neither of you brings the list up again.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.RELATIONSHIP_CONFLICT,
            reputation_deltas: {},
            relationship_deltas: {
              npc_varga: RELD.COMPETED_LOST
            },
            flags_set: []
          }
        }
      },
      {
        label: "Get your script back and find the four marks",
        stat_check: {
          stats: ["SM", "IN"],
          modifier: -0.05
        },
        outcomes: {
          success: {
            text: "Three of them are in a question you left half argued because the clock went, and one is a place where you were simply wrong. You never leave a question half argued again, in an exam or a paper or a grant.",
            stat_deltas: {
              SM: 0.5,
              IN: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["learned_from_the_script"]
          },
          failure: {
            text: "The marks are spread thin across six questions with nothing you can point at, which is worse news than a single mistake would have been. You put the script in a drawer and it stays there until you move out.",
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
        label: "Do not read the list twice",
        outcomes: {
          success: {
            text: "You take the week, sleep properly for the first time since March, and never look at the script. Whatever was in it stays unlearned, and you are the only person alive who still remembers who came second.",
            stat_deltas: {
              GR: -0.3
            },
            stress_delta: STRESS.REST,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["let_it_go"]
          }
        }
      }
    ]
  },
  {
    id: "g2_talk_that_dies",
    title: "Twelve minutes, second after lunch",
    text: "A contributed slot at the APS plasma meeting. You lose the thread on slide four, and when someone asks about your error bars you hear yourself say that you would have to check.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.GRAD_SCHOOL],
    age_range: [23, 29],
    weight: 3,
    cooldown_years: 3,
    max_fires: 2,
    choices: [
      {
        label: "Find the questioner at the coffee break",
        stat_check: {
          stats: ["CH", "GR"],
          modifier: 0.1
        },
        outcomes: {
          success: {
            text: "He does bolometry at Garching and he was not being unkind, only fast. He sketches the calibration you missed on the back of the programme. You use it for the next four years.",
            stat_deltas: {
              CH: 0.3,
              IN: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: 1,
              NET: 2
            },
            relationship_deltas: {},
            flags_set: ["asked_for_help"]
          },
          failure: {
            text: "You find him. He is polite and already thinking about something else. The conversation lasts ninety seconds and you replay it for the whole flight home.",
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
        label: "Redo the error analysis in your hotel room tonight",
        stat_check: {
          stats: ["SM", "IN"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "At two in the morning you find it: the calibration factor applied twice. The corrected numbers are worse and correct. You send the session chair a revised figure nobody asked for and he forwards it to two people who matter.",
            stat_deltas: {
              SM: 0.5,
              IN: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 2
            },
            relationship_deltas: {},
            flags_set: ["fixed_it_overnight"]
          },
          failure: {
            text: "Four hours confirm the analysis was right and the talk was bad, which is the harder of the two to fix.",
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
        label: "Skip the rest of the session and walk out into the city",
        outcomes: {
          success: {
            text: "You spend the afternoon in a museum in a city the conference is paying for you to be in. You miss the two talks closest to your topic and the dinner where the collaborations get arranged.",
            stat_deltas: {
              CH: -0.3
            },
            stress_delta: STRESS.REST,
            reputation_deltas: {
              NET: -1
            },
            relationship_deltas: {},
            flags_set: []
          }
        }
      }
    ]
  },
  {
    id: "g2_second_year_slump",
    title: "The second year",
    text: "Coursework is over, novelty is over, and the thing you are building will not be finished for three years. You have been at the desk since eight and have opened the same figure eleven times.",
    type: EVENT_TYPE.RANDOM,
    stage: [STAGE.GRAD_SCHOOL],
    age_range: [23, 27],
    weight: 4,
    cooldown_years: 3,
    max_fires: 1,
    choices: [
      {
        label: "Tell Okafor you are stuck",
        stat_check: {
          stats: ["CH"],
          modifier: 0.1
        },
        outcomes: {
          success: {
            text: "She says the second year is where most people quit, flatly, as information rather than comfort. Then she reorders your next six months into something with an end you can see from here.",
            stat_deltas: {
              CH: 0.3,
              GR: 0.3
            },
            stress_delta: STRESS.RELATIONSHIP_POSITIVE,
            reputation_deltas: {},
            relationship_deltas: {
              npc_okafor: RELD.HELPED
            },
            flags_set: ["asked_for_help"]
          },
          failure: {
            text: "She reads it as a technical problem and gives you forty minutes of good advice about a question you did not ask. You thank her for it, accurately.",
            stat_deltas: {
              SM: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: []
          }
        }
      },
      {
        label: "Keep the eight to eight and grind through it",
        stat_check: {
          stats: ["GR"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "You hold the hours and the figure eventually resolves into something defensible. It costs you two friendships you do not notice losing until the following spring.",
            stat_deltas: {
              GR: 0.8
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 2
            },
            relationship_deltas: {},
            flags_set: ["ground_through_it"]
          },
          failure: {
            text: "Six weeks of hours produce two usable plots. You start sleeping badly and calling it discipline.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: []
          }
        }
      },
      {
        label: "Take the two weeks of leave you are technically owed",
        outcomes: {
          success: {
            text: "Nothing breaks while you are gone. You come back with the same problem and slightly more of yourself, and your group meeting slides are two weeks thinner than everybody else's.",
            stat_deltas: {},
            stress_delta: STRESS.REST,
            reputation_deltas: {
              SCI: -1
            },
            relationship_deltas: {},
            flags_set: ["took_the_leave"]
          }
        }
      }
    ]
  },
  {
    id: "g2_smarter_undergrads",
    title: "The student who asks better questions",
    text: "You are running the undergraduate plasma lab. A second year asks why the Langmuir probe trace bends the way it does, and the honest answer is that you have never worked the sheath out from first principles.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.GRAD_SCHOOL],
    age_range: [23, 29],
    weight: 3,
    cooldown_years: 2,
    max_fires: 2,
    choices: [
      {
        label: "Say you do not know and derive it with her at the board",
        stat_check: {
          stats: ["SM", "CH"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "Forty minutes at a whiteboard, sheath physics from nothing, both of you learning. She writes to the department about your section. You are twenty minutes late to your own group meeting.",
            stat_deltas: {
              CH: 0.5,
              SM: 0.3
            },
            stress_delta: STRESS.MENTORING,
            reputation_deltas: {
              NET: 2
            },
            relationship_deltas: {},
            flags_set: ["taught_well"]
          },
          failure: {
            text: "You get the Bohm criterion slightly wrong in front of eleven people and correct it by email that night. She is gracious about it, which is worse than if she had not been.",
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
        label: "Offer her a summer project on your diagnostic",
        stat_check: {
          stats: ["CH", "GR"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "Ten weeks later she hands you a calibration routine cleaner than the one you wrote, and a list of three things wrong with your probe mounting. Your own chapter has not moved since May.",
            stat_deltas: {
              CH: 0.3,
              CO: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              NET: 2,
              SCI: 1
            },
            relationship_deltas: {},
            flags_set: ["supervised_undergrad"]
          },
          failure: {
            text: "She takes an internship at a national lab instead, which is plainly the right decision for her. You have already promised the summer to a project that no longer exists.",
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
        label: "Give the answer from the manual and keep the session moving",
        outcomes: {
          success: {
            text: "The lab finishes on time and you get your afternoon back. By week five she has stopped asking you things and started asking the postdoc.",
            stat_deltas: {
              CH: -0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              NET: -1
            },
            relationship_deltas: {},
            flags_set: []
          }
        }
      }
    ]
  },
  {
    id: "g2_timezone_collaborator",
    title: "Eleven hours behind",
    text: "Wei Zhou has your gyrokinetic runs and an eleven hour offset. They were due in March. It is May, the answer is always that they are nearly finished, and your fourth chapter cannot start without them.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.GRAD_SCHOOL],
    age_range: [24, 30],
    weight: 3,
    cooldown_years: 3,
    max_fires: 2,
    choices: [
      {
        label: "Take the six in the morning call every Tuesday",
        stat_check: {
          stats: ["CH", "GR"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "Thirty minutes a week at six, for four months. The runs arrive in September and are better than you asked for. He puts you second on his own paper without being prompted.",
            stat_deltas: {
              CH: 0.5,
              CO: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 2,
              NET: 2
            },
            relationship_deltas: {
              npc_zhou: RELD.COLLABORATED
            },
            flags_set: ["managed_a_collaborator"]
          },
          failure: {
            text: "He takes every call and misses every date. In August he mentions that his queue allocation was cut in April and he had not wanted to say so.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {
              npc_zhou: RELD.DISAGREED
            },
            flags_set: []
          }
        }
      },
      {
        label: "Run it yourself on the local cluster at lower resolution",
        stat_check: {
          stats: ["SM", "IN"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "Coarser grid, six weeks of wall clock, and a result that holds where it matters. It is not as good as his would have been and it exists, which turns out to be the relevant property.",
            stat_deltas: {
              SM: 0.5,
              GR: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 2
            },
            relationship_deltas: {
              npc_zhou: RELD.COMPETED_WON
            },
            flags_set: ["did_it_myself"]
          },
          failure: {
            text: "The local machine cannot resolve the electron scales and you spend six weeks proving it carefully. You go back to waiting, from further behind than when you started.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: []
          }
        }
      },
      {
        label: "Cut the chapter and restructure the thesis around what you have",
        outcomes: {
          success: {
            text: "Your committee will accept four chapters. You tell Zhou it is fine and mean most of it. The thesis is thinner, finishes on time, and never makes the claim you started out wanting to make.",
            stat_deltas: {},
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: -2
            },
            relationship_deltas: {},
            flags_set: ["cut_a_chapter"]
          }
        }
      }
    ]
  },
  {
    id: "g2_machine_time_pulled",
    title: "Four hours notice",
    text: "The email lands at eleven: the campaign is off, a coil interlock fault found on the morning checks, and your two shift days go to whoever can use them next week. You have been preparing since February.",
    type: EVENT_TYPE.RANDOM,
    stage: [STAGE.GRAD_SCHOOL],
    age_range: [22, 30],
    weight: 3,
    cooldown_years: 2,
    max_fires: 3,
    choices: [
      {
        label: "Put your name in for the reallocated slot within the hour",
        stat_check: {
          stats: ["CH", "CO"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "You get one shift, at night, ten days later, because you were the only person who asked before lunch. The scheduler remembers this about you afterwards.",
            stat_deltas: {
              CO: 0.5,
              CH: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {
              NET: 2,
              SCI: 1
            },
            relationship_deltas: {},
            flags_set: ["asked_first"]
          },
          failure: {
            text: "The slot goes to the group with a visiting collaborator already on a plane. You are told your case was strong, which is the standard phrasing for this.",
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
        label: "Spend the two days on last year's unfinished shots",
        stat_check: {
          stats: ["SM", "IN"],
          modifier: 0.1
        },
        outcomes: {
          success: {
            text: "Buried in the 2019 campaign is a density scan nobody wrote up. Two days inside somebody else's data becomes half a chapter and a figure your advisor uses in talks.",
            stat_deltas: {
              SM: 0.5,
              IN: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: 3
            },
            relationship_deltas: {},
            flags_set: ["mined_old_data"]
          },
          failure: {
            text: "The old shot files use a probe calibration nobody documented and the person who did it left in 2021. Two days, no result, and a permanent opinion about metadata.",
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
        label: "Take the two days back",
        outcomes: {
          success: {
            text: "You go home at noon on a Tuesday for the first time in a year and sleep eleven hours. The analysis you promised for group meeting stays exactly where it was.",
            stat_deltas: {},
            stress_delta: STRESS.REST,
            reputation_deltas: {
              SCI: -1
            },
            relationship_deltas: {},
            flags_set: []
          }
        }
      }
    ]
  },
  {
    id: "g2_visiting_offer",
    title: "An offer from the visitor",
    text: "Castellanos has been in the building a week. On the Friday he offers you a postdoc on his divertor programme, starting whenever you finish, and says he does not need to read the thesis first.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.GRAD_SCHOOL],
    age_range: [25, 30],
    weight: 3,
    cooldown_years: 4,
    max_fires: 1,
    choices: [
      {
        label: "Say yes on the spot",
        stat_check: {
          stats: ["CO", "CH"],
          modifier: 0.1
        },
        outcomes: {
          success: {
            text: "The letter arrives in a fortnight and is real. You spend the next eighteen months writing a thesis whose ending you already know, which is easier and less interesting than it sounds.",
            stat_deltas: {
              CO: 0.8,
              CH: 0.3
            },
            stress_delta: STRESS.MAJOR_SUCCESS,
            reputation_deltas: {
              NET: 4
            },
            relationship_deltas: {
              npc_castellanos: RELD.CHOSE_THEM
            },
            flags_set: ["postdoc_lined_up"]
          },
          failure: {
            text: "You accept, and in the spring he takes a directorship elsewhere. The position outlives him by four months. You learn how much of an offer is just a person.",
            stat_deltas: {
              CO: 0.3,
              GR: 0.3
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["offer_evaporated"]
          }
        }
      },
      {
        label: "Ask him to hold it until you defend",
        stat_check: {
          stats: ["CH"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "He says he can hold it a year, and that the people who ask for time are usually the ones who should get it. You finish without a countdown running and start in September.",
            stat_deltas: {
              CH: 0.5,
              CO: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              NET: 3
            },
            relationship_deltas: {
              npc_castellanos: RELD.SPOKE_WELL
            },
            flags_set: ["postdoc_lined_up"]
          },
          failure: {
            text: "He says the money is annual and cannot wait, in a friendly way that closes the subject. In March the post goes to somebody a year ahead of you whose thesis is already bound.",
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
        label: "Turn it down and stay on the machine you know",
        outcomes: {
          success: {
            text: "You tell him you are not finished being a student. He takes it well and the offer does not come back. Your experiment gets your whole attention for the first time in a year.",
            stat_deltas: {
              CO: -0.5,
              GR: 0.3
            },
            stress_delta: STRESS.REST,
            reputation_deltas: {
              NET: -2
            },
            relationship_deltas: {},
            flags_set: ["stayed_put"]
          }
        }
      }
    ]
  },
  {
    id: "g2_chapter_wont_start",
    title: "Chapter three",
    text: "Chapter three is the one that ties the measurement to the model. You have the data, the figures and a document that has said 3. Transport Analysis for nine weeks.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.GRAD_SCHOOL],
    age_range: [24, 30],
    weight: 4,
    cooldown_years: 2,
    max_fires: 2,
    choices: [
      {
        label: "Write the figure captions first and let the prose follow",
        stat_check: {
          stats: ["GR", "IN"],
          modifier: 0.1
        },
        outcomes: {
          success: {
            text: "Eleven captions in two days, then the section headers, then a paragraph that turns out to be the argument. Writing was never the hard part, only starting.",
            stat_deltas: {
              IN: 0.5,
              GR: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: 1
            },
            relationship_deltas: {},
            flags_set: ["chapter_started"]
          },
          failure: {
            text: "You write good captions for figures that do not yet make an argument. The ordering problem is still sitting there on Monday morning, in better typography.",
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
        label: "Send Okafor the worst possible draft",
        stat_check: {
          stats: ["CH", "GR"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "Nine pages, badly ordered, sent at one in the morning with an apology in the subject line. She returns it in red with the sentence you should have led with circled on page six.",
            stat_deltas: {
              SM: 0.3,
              IN: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: 1
            },
            relationship_deltas: {
              npc_okafor: RELD.COLLABORATED
            },
            flags_set: ["chapter_started"]
          },
          failure: {
            text: "She reads it as your considered position and takes it apart for an hour in group meeting. The chapter improves. You do not send her anything rough again for a year.",
            stat_deltas: {
              GR: 0.3,
              SM: 0.3
            },
            stress_delta: STRESS.RELATIONSHIP_CONFLICT,
            reputation_deltas: {},
            relationship_deltas: {
              npc_okafor: RELD.DISAGREED
            },
            flags_set: []
          }
        }
      },
      {
        label: "Book the writing room for a fortnight, no lab access",
        outcomes: {
          success: {
            text: "Fourteen days, no machine, no group meeting, and a first draft at the end of it. Your experiment sits cold and the Tuesday shifts go to someone else permanently.",
            stat_deltas: {
              CO: -0.3
            },
            stress_delta: STRESS.REST,
            reputation_deltas: {
              SCI: -1
            },
            relationship_deltas: {},
            flags_set: ["chapter_started"]
          }
        }
      }
    ]
  },
  {
    id: "g2_advisor_sabbatical",
    title: "He mentions it at the end of the meeting",
    text: "Lindqvist takes a year at Greifswald from September. He tells you as a detail, after the science. You are eighteen months from a defence and your committee needs a chair in the room.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.GRAD_SCHOOL],
    age_range: [24, 30],
    weight: 3,
    cooldown_years: 4,
    max_fires: 1,
    choices: [
      {
        label: "Ask to go with him",
        stat_check: {
          stats: ["CO", "CH"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "Nine months at a stellarator, with people who ask different questions about the same transport, and a chapter you would never have written at home. Your stipend is patched from three sources and arrives late twice.",
            stat_deltas: {
              IN: 0.5,
              CO: 0.5
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 3,
              NET: 3
            },
            relationship_deltas: {
              npc_lindqvist: RELD.CHOSE_THEM
            },
            flags_set: ["went_abroad"]
          },
          failure: {
            text: "The department will not transfer your funding across and he does not push. You stay. The year is what it would have been anyway, with the extra knowledge that you asked.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {
              npc_lindqvist: RELD.DISAGREED
            },
            flags_set: []
          }
        }
      },
      {
        label: "Ask Okafor to co-supervise for the year",
        stat_check: {
          stats: ["CH"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "She agrees on one condition: something in her inbox every fortnight, finished or not. It is more supervision than you have had since your first year, and the writing gets sharper for it.",
            stat_deltas: {
              SM: 0.5,
              CH: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: 2
            },
            relationship_deltas: {
              npc_okafor: RELD.CHOSE_THEM
            },
            flags_set: ["cosupervised"]
          },
          failure: {
            text: "She has two students finishing and says no, kindly and with reasons you cannot argue with. You end up reporting to a postdoc two years older than you who has his own deadlines.",
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
        label: "Run yourself for the year",
        outcomes: {
          success: {
            text: "Email, timezone adjusted, roughly monthly. Nobody changes your plan and nobody reads your drafts. The work is genuinely yours and the argument is never stress tested by anyone who knows the field better than you do.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: -2
            },
            relationship_deltas: {},
            flags_set: ["unsupervised_year"]
          }
        }
      }
    ]
  },
  {
    id: "g2_ghost_referee",
    title: "Draft me a report by Friday",
    text: "Lindqvist forwards a manuscript from Physics of Plasmas with one line of instruction. It is the closest work to yours you have ever read, and it is nine months from being public.",
    type: EVENT_TYPE.RANDOM,
    stage: [STAGE.GRAD_SCHOOL],
    age_range: [24, 30],
    weight: 2,
    cooldown_years: 3,
    max_fires: 2,
    choices: [
      {
        label: "Write an honest report and let your own paper take its time",
        stat_check: {
          stats: ["SM"],
          modifier: 0.1
        },
        outcomes: {
          success: {
            text: "Four pages of useful criticism, and you learn more about your own problem than a month of running taught you. You also now know their result early and cannot un-know it.",
            stat_deltas: {
              SM: 0.5,
              IN: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 1
            },
            relationship_deltas: {},
            flags_set: ["ghost_refereed"]
          },
          failure: {
            text: "The report is thorough and unmistakably written by somebody in the same subfield. The authors work out who you must be, and mention it at the next meeting in a way that is almost a joke.",
            stat_deltas: {
              SM: 0.3
            },
            stress_delta: STRESS.RELATIONSHIP_CONFLICT,
            reputation_deltas: {},
            relationship_deltas: {
              npc_bello: RELD.DISAGREED
            },
            flags_set: ["ghost_refereed"]
          }
        }
      },
      {
        label: "Write the report, then get your own submission out first",
        stat_check: {
          stats: ["GR", "SM"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "You recommend minor revisions, which is fair, and submit yours eleven days later. Both appear in the same issue. Nobody says a word about it, then or ever.",
            stat_deltas: {
              GR: 0.5,
              SM: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 3
            },
            relationship_deltas: {
              npc_bello: RELD.COMPETED_WON
            },
            flags_set: ["used_referee_knowledge"]
          },
          failure: {
            text: "You rush it. Your own referees are unimpressed by the haste and you spend three months on revisions you could have done before submitting, with their paper out and accumulating citations in the meantime.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: []
          }
        }
      },
      {
        label: "Tell him you are conflicted and should not be reading it",
        outcomes: {
          success: {
            text: "He says that is probably right, in the tone of a man adding a task to his own list. Their paper appears in November, four weeks before yours, and you learn nothing you could have used.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: -1
            },
            relationship_deltas: {},
            flags_set: ["declared_conflict"]
          }
        }
      }
    ]
  },
  {
    id: "g2_sign_error",
    title: "A sign in the averaging",
    text: "The transport code you inherited has the flux surface average convention flipped. It moves your numbers by four percent. It also moves the figures in a paper your group published two years ago.",
    type: EVENT_TYPE.RANDOM,
    stage: [STAGE.GRAD_SCHOOL],
    age_range: [23, 30],
    weight: 2,
    cooldown_years: 4,
    max_fires: 1,
    choices: [
      {
        label: "Tell Okafor and help write the corrigendum",
        stat_check: {
          stats: ["SM", "CH"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "The correction is two paragraphs and the conclusion survives it. She describes the episode at group meeting, using your name, as the way this is supposed to go.",
            stat_deltas: {
              SM: 0.5,
              CH: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: 3
            },
            relationship_deltas: {
              npc_okafor: RELD.HELPED
            },
            flags_set: ["honest_operator"]
          },
          failure: {
            text: "Four months, two original authors arguing by email, and a published conclusion that goes from clear to suggestive. Your name ends up on the fix rather than the result.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              SCI: 1
            },
            relationship_deltas: {},
            flags_set: ["honest_operator"]
          }
        }
      },
      {
        label: "Reproduce the old paper's cases before saying anything",
        stat_check: {
          stats: ["GR", "SM"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "Three weeks inside somebody else's input decks, and the shift sits inside their stated uncertainty. You send the first author a short note. He thanks you and does nothing, correctly.",
            stat_deltas: {
              SM: 0.5,
              GR: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {
              SCI: 1
            },
            relationship_deltas: {},
            flags_set: []
          },
          failure: {
            text: "Three weeks, and you cannot reproduce their original figures at all, with the sign either way. Now you have a larger problem and no clean way to raise it.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: []
          }
        }
      },
      {
        label: "Fix it in your own branch and move on",
        outcomes: {
          success: {
            text: "Your numbers are right from here forward. The paper stands and picks up eleven more citations, and you never read that section again.",
            stat_deltas: {},
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: -1
            },
            relationship_deltas: {},
            flags_set: ["quiet_fix"]
          }
        }
      }
    ]
  },
  {
    id: "g2_shot_forty_one",
    title: "Shot 41",
    text: "Nine discharges in the density scan and one sits off the trend by a factor of two. The logbook says the fuelling valve was retuned that morning. Without it the fit is a curve you could publish.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.GRAD_SCHOOL],
    age_range: [24, 30],
    weight: 3,
    cooldown_years: 3,
    max_fires: 1,
    choices: [
      {
        label: "Keep it in and publish the scatter",
        stat_check: {
          stats: ["SM", "GR"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "The fit is ugly and the paper says so in the second paragraph. A referee calls the treatment of shot 41 the most useful page in it, and two groups write to ask about outliers of their own.",
            stat_deltas: {
              SM: 0.3,
              GR: 0.5
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: 3
            },
            relationship_deltas: {},
            flags_set: ["honest_operator"]
          },
          failure: {
            text: "With shot 41 in, the trend is not significant and the paper is not a paper. You have nine discharges, a clean conscience and no claim.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: []
          }
        }
      },
      {
        label: "Exclude it, with a sentence in the appendix",
        stat_check: {
          stats: ["SM", "CH"],
          modifier: 0.1
        },
        outcomes: {
          success: {
            text: "One line about the valve retune at the back, one clean figure in the body. Everybody who matters reads the body. It goes to Nuclear Fusion and does well for years.",
            stat_deltas: {
              SM: 0.3,
              CH: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: 4
            },
            relationship_deltas: {},
            flags_set: ["trimmed_the_data"]
          },
          failure: {
            text: "A referee asks for the excluded point plotted on the same axes. You add it, the trend softens, and your appendix sentence now reads like something you hoped nobody would reach.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              SCI: 1
            },
            relationship_deltas: {},
            flags_set: ["trimmed_the_data"]
          }
        }
      },
      {
        label: "Shelve the scan and write the diagnostics chapter instead",
        outcomes: {
          success: {
            text: "The scan waits for a campaign that may not come. The diagnostics chapter is uncontroversial, takes five weeks, and will not be cited by anyone outside your committee.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.REST,
            reputation_deltas: {
              SCI: -1
            },
            relationship_deltas: {},
            flags_set: []
          }
        }
      }
    ]
  },
  {
    id: "g2_conference_or_campaign",
    title: "Chengdu or the last campaign",
    text: "The IAEA meeting is in October. The final campaign before the vessel opens for the tungsten upgrade runs the same fortnight. Your name is on the abstract and on the shift roster.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.GRAD_SCHOOL],
    age_range: [24, 30],
    weight: 3,
    cooldown_years: 3,
    max_fires: 2,
    choices: [
      {
        label: "Go to Chengdu",
        stat_check: {
          stats: ["CH", "CO"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "Fifteen minutes in front of two hundred people, and a corridor conversation with the two men who will referee your first real paper. Your shifts are covered by a postdoc who runs them differently than you would have.",
            stat_deltas: {
              CH: 0.5,
              CO: 0.5
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              NET: 4,
              SCI: 2
            },
            relationship_deltas: {},
            flags_set: ["went_to_iaea"]
          },
          failure: {
            text: "The talk is fine and unremarkable and the corridor conversations happen near you rather than with you. You come home to a fortnight of data taken at the wrong probe bias.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              NET: 1
            },
            relationship_deltas: {},
            flags_set: []
          }
        }
      },
      {
        label: "Stay for the campaign",
        stat_check: {
          stats: ["GR", "IN"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "Fourteen days on shift and the last clean detachment scan anyone will take on that wall for three years. Two chapters come out of it. Nobody at the meeting knows your face.",
            stat_deltas: {
              GR: 0.5,
              IN: 0.5
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 4
            },
            relationship_deltas: {},
            flags_set: ["stayed_on_shift"]
          },
          failure: {
            text: "The vessel opens two weeks early, the campaign is cut to five days, and you traded a conference for a scan that stops halfway down the density axis.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: []
          }
        }
      },
      {
        label: "Send the poster with Varga and stay home",
        outcomes: {
          success: {
            text: "She presents your figures competently and answers what she can, which is most of it. You get a fortnight of ordinary weeks, and nobody in Chengdu attaches a person to the work.",
            stat_deltas: {},
            stress_delta: STRESS.REST,
            reputation_deltas: {
              NET: -2
            },
            relationship_deltas: {
              npc_varga: RELD.COLLABORATED
            },
            flags_set: []
          }
        }
      }
    ]
  },
  {
    id: "g2_fellowship_deadline",
    title: "Fifteen pages, due the wrong week",
    text: "The graduate fellowship is three years of your own money and a line on every application you will ever write. The proposal is fifteen pages and closes the week your campaign starts.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.GRAD_SCHOOL],
    age_range: [22, 28],
    weight: 3,
    cooldown_years: 3,
    max_fires: 2,
    choices: [
      {
        label: "Write it properly and lose the fortnight",
        stat_check: {
          stats: ["SM", "CH"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "Awarded. You are no longer paid from your advisor's grant, which quietly changes what you are allowed to say in meetings and how fast he answers your email.",
            stat_deltas: {
              CO: 0.5,
              CH: 0.3
            },
            stress_delta: STRESS.MAJOR_SUCCESS,
            reputation_deltas: {
              SCI: 3,
              NET: 2
            },
            relationship_deltas: {},
            flags_set: ["won_fellowship"]
          },
          failure: {
            text: "Not funded, no feedback beyond a sentence about a competitive pool. Fifteen pages, two weeks of the campaign, nothing on the other side of it.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["grant_rejected_once"]
          }
        }
      },
      {
        label: "Rebuild your qualifying exam proposal over three evenings",
        stat_check: {
          stats: ["IN", "SM"],
          modifier: -0.2
        },
        outcomes: {
          success: {
            text: "It reads exactly like what it is, and is funded anyway, because the underlying idea is good and the pool was small that year. You keep the fortnight and the shifts.",
            stat_deltas: {
              IN: 0.3,
              CO: 0.5
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: 2
            },
            relationship_deltas: {},
            flags_set: ["won_fellowship"]
          },
          failure: {
            text: "One reviewer writes that the proposal appears to have been assembled rather than written. It is accurate, and you think about the phrasing for years.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["grant_rejected_once"]
          }
        }
      },
      {
        label: "Skip it and stay on the grant",
        outcomes: {
          success: {
            text: "Nothing about your week changes, which is the point. The people who win these things carry on being the people who win these things, and one of them sits two desks along.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: -1,
              NET: -1
            },
            relationship_deltas: {},
            flags_set: []
          }
        }
      }
    ]
  },
  {
    id: "g2_varga_stuck",
    title: "Varga's reconstruction will not converge",
    text: "Her equilibrium solver has been failing for a month and her committee meeting is in three weeks. You hit the same wall last year. Fixing it for her is two full days, and your own chapter is nine weeks late.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.GRAD_SCHOOL],
    age_range: [23, 29],
    weight: 3,
    cooldown_years: 2,
    max_fires: 2,
    choices: [
      {
        label: "Sit with her until it converges",
        stat_check: {
          stats: ["SM", "CH"],
          modifier: 0.1
        },
        outcomes: {
          success: {
            text: "Two days, then a third. It was the boundary condition on the outer flux surface, of course it was. She makes her committee date and tells everyone in the group who found it.",
            stat_deltas: {
              CH: 0.5,
              SM: 0.3
            },
            stress_delta: STRESS.MENTORING,
            reputation_deltas: {
              NET: 3
            },
            relationship_deltas: {
              npc_varga: RELD.HELPED
            },
            flags_set: ["helped_a_peer"]
          },
          failure: {
            text: "Three days and it still will not converge for her geometry. You have lost the week and she has to postpone. Neither of you says the obvious thing about whose problem it was.",
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
        label: "Fix it, and ask to go on the paper that comes out of it",
        stat_check: {
          stats: ["CH", "CO"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "She agrees without hesitating, which makes you feel worse than a refusal would have. Second author on a chapter you spent three days inside.",
            stat_deltas: {
              CO: 0.3,
              SM: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {
              SCI: 3
            },
            relationship_deltas: {
              npc_varga: RELD.SHARED_CREDIT
            },
            flags_set: ["traded_help_for_credit"]
          },
          failure: {
            text: "She says yes and something in the friendship goes formal. You get the authorship and, for the remaining two years, careful email.",
            stat_deltas: {
              CO: 0.3
            },
            stress_delta: STRESS.RELATIONSHIP_CONFLICT,
            reputation_deltas: {
              SCI: 2
            },
            relationship_deltas: {
              npc_varga: RELD.DISAGREED
            },
            flags_set: ["traded_help_for_credit"]
          }
        }
      },
      {
        label: "Send her your notes and get back to your chapter",
        outcomes: {
          success: {
            text: "Forty minutes writing up what you remember, which is most of it. She works the rest out alone eight days later, and after that she brings her problems to somebody else first.",
            stat_deltas: {},
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              NET: -1
            },
            relationship_deltas: {
              npc_varga: RELD.IGNORED
            },
            flags_set: []
          }
        }
      }
    ]
  },
  {
    id: "g2_vessel_entry",
    title: "Fifteen minutes you do not have",
    text: "To get the probe in before the morning run, the vessel entry has to be signed off before the oxygen monitor reading rather than after. The technician suggests the two of you simply remember it in the other order.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.GRAD_SCHOOL],
    age_range: [23, 30],
    weight: 2,
    cooldown_years: 4,
    max_fires: 1,
    choices: [
      {
        label: "Sign it and go in",
        stat_check: {
          stats: ["GR", "IN"],
          modifier: -0.2
        },
        outcomes: {
          success: {
            text: "Nothing happens, because nothing usually happens. The probe goes in, the run is good, and you think about that logbook line every time you open the chapter it produced.",
            stat_deltas: {
              IN: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {
              SCI: 2
            },
            relationship_deltas: {},
            flags_set: ["cut_a_safety_corner"]
          },
          failure: {
            text: "The safety officer pulls entry records in a routine audit six weeks later. Nobody was hurt and nobody is dismissed. Vessel access for the group is suspended for a month and everyone knows whose signature it was.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              SCI: -2,
              NET: -2
            },
            relationship_deltas: {},
            flags_set: ["cut_a_safety_corner"]
          }
        }
      },
      {
        label: "Ask the shift leader to move the sequence officially",
        stat_check: {
          stats: ["CH", "CO"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "One phone call and the run slips twenty minutes. He adds a standing note to the procedure, and two campaigns later people still do it your way without knowing why.",
            stat_deltas: {
              CH: 0.5,
              CO: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              NET: 3,
              SCI: 1
            },
            relationship_deltas: {},
            flags_set: ["changed_a_procedure"]
          },
          failure: {
            text: "He will not move a sequence for a graduate student, and says so on an open channel with four people listening. You lose the slot and a small amount of standing.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {
              NET: -1
            },
            relationship_deltas: {},
            flags_set: []
          }
        }
      },
      {
        label: "Wait for the monitor reading",
        outcomes: {
          success: {
            text: "You miss the slot by nine minutes and the run goes ahead without your probe. The technician is fine about it, the logbook is clean, and your dataset has a gap you will be explaining at the defence.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: -1
            },
            relationship_deltas: {},
            flags_set: []
          }
        }
      }
    ]
  },
];
