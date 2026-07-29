// Additional career events, authored to widen the pool.
// Same schema and voice as events_career.js. Safe (roll-free) choices pay in
// stress relief rather than reputation, so caution buys future odds instead of
// being strictly worse than gambling.
import { EVENT_TYPE } from '../engine/events.js';
import { STAGE } from '../engine/stages.js';
import { STRESS } from '../engine/stress.js';
import { REL as RELD } from '../engine/relationships.js';

export const EXTRA_EVENTS = [
  {
    id: "nc_first_office_hours",
    title: "Office hours, first time",
    text: "You have four pages of algebra and a factor of two that will not go away. Okafor's door is open from two to four on Wednesdays and there is nobody else in the corridor.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.COLLEGE],
    age_range: [18, 20],
    weight: 3,
    cooldown_years: 3,
    max_fires: 1,
    choices: [
      {
        label: "Take the wrong work in",
        stat_check: {
          stats: ["GR"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "She finds the sign error in ninety seconds, then spends an hour on why you made it. You leave with more work than you arrived with and a standing invitation.",
            stat_deltas: {
              SM: 0.5,
              GR: 0.5
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {},
            relationship_deltas: {
              npc_okafor: RELD.CHOSE_THEM
            },
            flags_set: ["met_okafor", "asks_for_help"]
          },
          failure: {
            text: "Two students from the year above are already in there with better questions. You get eight minutes at the end and use six of them apologising for taking them.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["froze_once"]
          }
        }
      },
      {
        label: "Fix it yourself, however long it takes",
        outcomes: {
          success: {
            text: "You find it at two in the morning on the third night: a Jacobian dropped on page one. Nobody knows you did it, and nobody knows you can do it.",
            stat_deltas: {
              SM: 0.3,
              GR: 0.5
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["self_taught_start"]
          }
        }
      },
      {
        label: "Ask Varga instead",
        stat_check: {
          stats: ["CH"],
          modifier: 0.1
        },
        outcomes: {
          success: {
            text: "She has made the same mistake and says so, which is worth more than the correction. You trade problem sets for the rest of the degree.",
            stat_deltas: {
              SM: 0.5,
              CH: 0.5
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {},
            relationship_deltas: {
              npc_varga: RELD.COLLABORATED
            },
            flags_set: ["trades_notes"]
          },
          failure: {
            text: "She is three weeks ahead and explains it at her own speed. You nod through the whole thing and look it up properly that evening.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["self_taught_start"]
          }
        }
      }
    ]
  },
  {
    id: "nc_midterm_thirty_eight",
    title: "Thirty-eight",
    text: "The electromagnetism midterm comes back with a 38 on it and a class mean of 51. There is an optional retake in three weeks, capped at seventy percent of the marks.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.COLLEGE],
    age_range: [18, 21],
    weight: 3,
    cooldown_years: 4,
    max_fires: 1,
    choices: [
      {
        label: "Sit the retake",
        stat_check: {
          stats: ["GR", "SM"],
          modifier: -0.05
        },
        outcomes: {
          success: {
            text: "You get a 91, which the cap turns into a 64, which is exactly enough. The three weeks cost you every lab hour and taught you boundary conditions for good.",
            stat_deltas: {
              SM: 0.5,
              GR: 0.5
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["retook_the_exam"]
          },
          failure: {
            text: "You get a 58 on the retake, and the cap makes it worse than it sounds. You gave up the lab hours for two marks, and the grade stands on the transcript for as long as anyone bothers to look at transcripts.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["weak_transcript"]
          }
        }
      },
      {
        label: "Keep the 38, keep the lab hours",
        outcomes: {
          success: {
            text: "You bank the bad grade and spend the three weeks learning to align the interferometer reference arm until the fringe count stops jumping when someone shuts the door. The 38 stays where it is. Nobody asks about the alignment for another six years.",
            stat_deltas: {
              IN: 0.5,
              CO: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["weak_transcript", "chose_the_bench"]
          }
        }
      }
    ]
  },
  {
    id: "nc_night_shift",
    title: "Twenty hours a week",
    text: "The loading dock pays fourteen an hour on nights and covers rent. The lab pays nothing and has a spare corner where an undergraduate could learn to run a vacuum system.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.COLLEGE],
    age_range: [18, 21],
    weight: 4,
    cooldown_years: 5,
    max_fires: 1,
    choices: [
      {
        label: "Do both. Sleep less.",
        stat_check: {
          stats: ["GR"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "Five hours a night for a year. You get the vacuum system and the rent, and a tolerance for exhaustion that will be useful and expensive later.",
            stat_deltas: {
              GR: 0.8,
              IN: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["money_ok", "works_tired"]
          },
          failure: {
            text: "You fall asleep in the Thursday lecture twice and once in the control room. Something has to go, and by March it is the lab.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["money_ok", "burned_out_once"]
          }
        }
      },
      {
        label: "Take the shifts. The lab can wait a year.",
        outcomes: {
          success: {
            text: "Rent is paid on time every month, which is not nothing. By the time you have room for the lab there is someone else in the corner.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.REST,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["money_ok", "no_lab_yet"]
          }
        }
      },
      {
        label: "Ask Okafor whether the lab can find money",
        stat_check: {
          stats: ["CH", "CO"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "She finds four hours a week of work-study by moving a line item nobody was watching. It is not the dock wage. It is enough, and you are in the room.",
            stat_deltas: {
              CH: 0.5,
              CO: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {},
            relationship_deltas: {
              npc_okafor: RELD.COLLABORATED
            },
            flags_set: ["met_okafor", "money_tight"]
          },
          failure: {
            text: "There is no money and she is straightforward about it: the grant pays for helium, not for undergraduates. She keeps the corner open anyway, unpaid, which is what she has.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["met_okafor", "money_tight"]
          }
        }
      }
    ]
  },
  {
    id: "nc_lab_partner_number",
    title: "The point that does not fit",
    text: "Your partner has written a fourth peak into the Franck-Hertz data that the apparatus did not produce. The report is due at nine and the spacing is obvious anyway.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.COLLEGE],
    age_range: [18, 21],
    weight: 3,
    cooldown_years: 4,
    max_fires: 1,
    choices: [
      {
        label: "Rerun the sweep tonight",
        stat_check: {
          stats: ["GR"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "Four hours in an empty teaching lab, and the real peak sits almost where the invented one did. Almost is the entire difference, and now you can say so.",
            stat_deltas: {
              GR: 0.5,
              SM: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["honest_operator"]
          },
          failure: {
            text: "The oven takes an hour to come to temperature and you run out of night. You hand in three peaks and a paragraph about the fourth, lose marks for an incomplete data set, and go to the nine o'clock lecture with none of it in your head.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["honest_operator"]
          }
        }
      },
      {
        label: "Tell them to take it out",
        stat_check: {
          stats: ["CH"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "They take it out, irritably, and the report goes in three peaks short and honest. Two weeks later they ask you to partner again, which is the answer.",
            stat_deltas: {
              CH: 0.5,
              CO: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["honest_operator"]
          },
          failure: {
            text: "They point out that this is a teaching lab and not the Physical Review, and they are not entirely wrong. The peak stays in. You take your name off it and write your own overnight.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.RELATIONSHIP_CONFLICT,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["stood_alone_once"]
          }
        }
      },
      {
        label: "Sign it and say nothing",
        outcomes: {
          success: {
            text: "You get a 92, the demonstrator writes clean work across the front page, and you are asleep by eleven for the first time that term. Your partner writes the whole of the next three reports without being asked, which is what the ninety-two actually bought.",
            stat_deltas: {
              CH: 0.3,
              CO: 0.3
            },
            stress_delta: STRESS.REST,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["looked_away_once"]
          }
        }
      }
    ]
  },
  {
    id: "nc_club_fusor",
    title: "The fusor in the student shop",
    text: "Three of you have a vacuum chamber, a 40 kV supply from a surplus sale, and enough deuterium to make actual neutrons. What you do not have is anything on file with the radiation safety office.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.COLLEGE],
    age_range: [19, 22],
    weight: 2,
    cooldown_years: 5,
    max_fires: 1,
    choices: [
      {
        label: "File the paperwork and do it properly",
        stat_check: {
          stats: ["GR", "CH"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "Six weeks of forms, a survey meter, a bubble dosimeter each, and a staff supervisor who turns out to be delighted. You see counts on a Thursday in March, and they are yours, and they are on the record with your name on the record next to them.",
            stat_deltas: {
              GR: 0.5,
              IN: 0.5
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 1
            },
            relationship_deltas: {},
            flags_set: ["built_fusor", "honest_operator"]
          },
          failure: {
            text: "The safety office approves the chamber and not the deuterium. You run it on hydrogen instead, which glows very well at 40 kV and produces no neutrons at all, and the deuterium application is still open when you graduate.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["honest_operator", "no_neutrons"]
          }
        }
      },
      {
        label: "Run it quietly over a weekend",
        stat_check: {
          stats: ["IN", "SM"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "Thirty-eight kilovolts, twelve milliamps, and a silver activation counter that puts you somewhere around ten thousand neutrons a second at two in the morning. Everything is back in its crate before the shop opens. The supply goes back to surplus at the end of the month, so nobody else in the club will ever see a count, and you will feel two ways about that for years.",
            stat_deltas: {
              IN: 0.8,
              SM: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["built_fusor", "cut_a_corner"]
          },
          failure: {
            text: "A flashover across the high voltage feedthrough kills the supply and trips the panel for half the building. The safety office finds out the way safety offices always do, and the shop is closed to students for a term.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["cut_a_corner", "shop_ban"]
          }
        }
      },
      {
        label: "Stay with the simulation",
        outcomes: {
          success: {
            text: "You model the grid geometry instead and end up knowing more about ion optics than the people welding flanges. It is real work. It is also the second time this year you chose the screen.",
            stat_deltas: {
              SM: 0.5
            },
            stress_delta: STRESS.REST,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["prefers_theory"]
          }
        }
      }
    ]
  },
  {
    id: "nc_summer_spoken_for",
    title: "Summer, spoken for",
    text: "The research placement is ten weeks, two thousand miles away, and pays six thousand dollars. Your mother has not asked you to come home, which is how you know.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.COLLEGE],
    age_range: [19, 21],
    weight: 2,
    cooldown_years: 5,
    max_fires: 1,
    choices: [
      {
        label: "Take the placement",
        stat_check: {
          stats: ["GR"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "Ten weeks on a small tokamak, mostly writing analysis scripts against somebody else's shot list. You call every Sunday. In August they ask whether you are coming back next year, and they ask in front of the group leader.",
            stat_deltas: {
              SM: 0.5,
              CO: 0.5
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 1
            },
            relationship_deltas: {},
            flags_set: ["lab_summer", "money_ok"]
          },
          failure: {
            text: "You go, and you spend the summer on the phone with a situation you cannot fix from two thousand miles away. The scripts get written. Nobody asks you back.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.LIFE_EVENT,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["lab_summer"]
          }
        }
      },
      {
        label: "Go home",
        outcomes: {
          success: {
            text: "Twelve weeks of shifts at the same place you worked in school, and the evenings in the front room with the person who needed you in it. The placement goes to someone in your year who mentions it for the next four.",
            stat_deltas: {
              GR: 0.5,
              CH: 0.3
            },
            stress_delta: STRESS.LIFE_EVENT,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["went_home", "money_ok"]
          }
        }
      }
    ]
  },
  {
    id: "nc_roommate_offer_letter",
    title: "Your roommate's offer letter",
    text: "She has a third-year internship that pays more than a postdoc and a return offer with a number written on it. You have a problem set and a plot of confinement time against machine size.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.COLLEGE],
    age_range: [19, 22],
    weight: 3,
    cooldown_years: 4,
    max_fires: 1,
    choices: [
      {
        label: "Stay with physics, no hedge",
        outcomes: {
          success: {
            text: "You do the arithmetic once, properly, and then decide anyway. You will do it again every few years and get the same answer, which is not the same as it being easy.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["ran_the_numbers", "committed_to_physics"]
          }
        }
      },
      {
        label: "Take the computing minor as insurance",
        stat_check: {
          stats: ["SM", "GR"],
          modifier: -0.05
        },
        outcomes: {
          success: {
            text: "Two extra courses a term for two years. You are tired in a new way, and you can write code that other people can read, which the field is quietly desperate for.",
            stat_deltas: {
              SM: 0.5,
              GR: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["can_code"]
          },
          failure: {
            text: "You carry seven courses into the spring and are down to five by March, with the physics half the casualty. The minor stays unfinished and visible on the transcript.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["weak_transcript"]
          }
        }
      },
      {
        label: "Interview for the same job",
        stat_check: {
          stats: ["SM", "CH"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "You get the offer and turn it down in October, which is a different thing from never having had one. The number stays in your head afterwards as a floor rather than a temptation.",
            stat_deltas: {
              CH: 0.3,
              CO: 0.5
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["had_the_offer"]
          },
          failure: {
            text: "Four rounds and a rejection on a Friday afternoon, for a job you did not want. It stings in a way you did not expect and cannot defend to anyone, including yourself.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: []
          }
        }
      }
    ]
  },
  {
    id: "nc_senior_thesis_pick",
    title: "Two theses",
    text: "Two topics on offer for the year. A Langmuir probe you would design, build, and possibly never get into a plasma. Or a transport code you would extend, which produces a chapter whatever happens.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.COLLEGE],
    age_range: [20, 22],
    weight: 3,
    cooldown_years: 3,
    max_fires: 1,
    choices: [
      {
        label: "Build the probe",
        stat_check: {
          stats: ["IN", "GR"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "It goes in on the last campaign of the spring and returns a density profile that is noisy, real, and yours. The next probe you build takes eleven weeks instead of thirty.",
            stat_deltas: {
              IN: 0.8,
              GR: 0.5
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 2
            },
            relationship_deltas: {},
            flags_set: ["built_hardware"]
          },
          failure: {
            text: "The tip melts on the second insertion and the machine goes into shutdown a week later. You write forty pages about a probe that took one useful shot, and you defend them honestly.",
            stat_deltas: {
              GR: 0.5,
              IN: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["built_hardware", "first_failure"]
          }
        }
      },
      {
        label: "Extend the code",
        stat_check: {
          stats: ["SM"],
          modifier: 0.1
        },
        outcomes: {
          success: {
            text: "You add a neutrals model, benchmark it against three published cases, and it agrees to within eight percent. Two of the six departments you apply to mention it by name.",
            stat_deltas: {
              SM: 0.8
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: 1
            },
            relationship_deltas: {},
            flags_set: ["can_code"]
          },
          failure: {
            text: "The benchmark never quite closes, and you spend two terms chasing a factor you eventually find in somebody else's boundary condition. The chapter exists. It cost more than it looks like it cost.",
            stat_deltas: {
              SM: 0.5,
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["can_code"]
          }
        }
      }
    ]
  },
  {
    id: "nc_twelve_applications",
    title: "Twelve at a hundred and five",
    text: "Graduate applications are a hundred and five dollars each and everyone tells you to apply widely. The three places doing the work you actually want are all long shots, and you can afford six.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.COLLEGE],
    age_range: [20, 22],
    weight: 4,
    cooldown_years: 5,
    max_fires: 1,
    choices: [
      {
        label: "Six applications, all reaches",
        stat_check: {
          stats: ["SM", "CO"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "Two interviews and one offer, from the group you would have picked out of any list in the world. You will never know how close it was.",
            stat_deltas: {
              SM: 0.5,
              CO: 0.5
            },
            stress_delta: STRESS.MAJOR_SUCCESS,
            reputation_deltas: {
              SCI: 2
            },
            relationship_deltas: {},
            flags_set: ["aimed_high"]
          },
          failure: {
            text: "Six rejections between February and April, the last arriving while you are at work. You apply again the following year from a technician job, older and considerably better prepared.",
            stat_deltas: {
              GR: 0.8
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["aimed_high", "gap_year"]
          }
        }
      },
      {
        label: "Three reaches, three safe",
        outcomes: {
          success: {
            text: "You get into a solid department doing adjacent work, and you go, because it is funded and it is September. It turns out to be a real career. It is just not the one you drew.",
            stat_deltas: {
              CO: 0.3,
              GR: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["went_safe"]
          }
        }
      },
      {
        label: "Take a technician job first",
        stat_check: {
          stats: ["GR", "CH"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "Eighteen months running a beamline for people with doctorates, learning the parts of the job nobody teaches. You apply with three letters from people who have watched you work.",
            stat_deltas: {
              GR: 0.5,
              IN: 0.5
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["tech_year", "money_ok"]
          },
          failure: {
            text: "The job is real and the applications keep sliding a year. You are twenty-six before you start, which was not the plan.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["tech_year", "late_start"]
          }
        }
      }
    ]
  },
  {
    id: "nc_registration_deadline",
    title: "The registration deadline",
    text: "The regional plasma meeting is three states away. Registration is three hundred and forty dollars, the department will cover half, and the flight is not covered at all.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.COLLEGE],
    age_range: [19, 22],
    weight: 2,
    cooldown_years: 4,
    max_fires: 2,
    choices: [
      {
        label: "Put the rest on the card",
        outcomes: {
          success: {
            text: "You go on the cheap flights, which means you land at midnight and leave before the Wednesday sessions. You stand next to your poster for four hours and meet two people whose names you will still recognise in twenty years. The card takes nine months to clear.",
            stat_deltas: {
              CO: 0.3,
              CH: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              NET: 1
            },
            relationship_deltas: {},
            flags_set: ["money_tight", "first_meeting"]
          }
        }
      },
      {
        label: "Ask the department for the rest",
        stat_check: {
          stats: ["CH"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "The graduate secretary finds an undergraduate travel fund that has not been spent in three years and puts you in for the flight and both nights. You stay for the Wednesday sessions and the argument that starts in one of them, and the department chair now knows which one you are. Asking took eleven minutes. You had put it off for two weeks.",
            stat_deltas: {
              CH: 0.5,
              CO: 0.5
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              NET: 3
            },
            relationship_deltas: {},
            flags_set: ["first_meeting", "asks_for_help"]
          },
          failure: {
            text: "The answer is a form, and the form closed in October. It is nobody's fault, and you are still not going.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["money_tight"]
          }
        }
      }
    ]
  },
  {
    id: "nc_public_shot_database",
    title: "Four weeks and a public database",
    text: "A national lab has put twenty years of shot data online, disruption flags and all, and nobody has asked you to do anything with it. Term ends on the fifteenth.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.COLLEGE],
    age_range: [18, 22],
    weight: 3,
    cooldown_years: 3,
    max_fires: 2,
    choices: [
      {
        label: "Spend the break on it",
        stat_check: {
          stats: ["SM", "IN"],
          modifier: -0.05
        },
        outcomes: {
          success: {
            text: "Four weeks, a laptop, and a kitchen table at home. In one class of shots the locked mode signal turns up about forty milliseconds before the disruption flag does, and nobody has written that class up, and it is small, and it is yours.",
            stat_deltas: {
              SM: 0.5,
              IN: 0.5
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 1
            },
            relationship_deltas: {},
            flags_set: ["self_taught_start", "found_something"]
          },
          failure: {
            text: "Three weeks of cleaning data and one week of working out that the effect is an artefact of the rate the magnetics are downsampled to before the database publishes them. You learn the file format and the taste of a dead end.",
            stat_deltas: {
              SM: 0.3,
              GR: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["self_taught_start"]
          }
        }
      },
      {
        label: "Show Okafor and ask for credit",
        stat_check: {
          stats: ["CH", "CO"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "She turns it into a two-credit independent study: a deadline, a meeting every fortnight, and a reader for whatever you produce. You get less of it done and defend all of it properly.",
            stat_deltas: {
              SM: 0.3,
              CH: 0.5
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {},
            relationship_deltas: {
              npc_okafor: RELD.COLLABORATED
            },
            flags_set: ["met_okafor", "independent_study"]
          },
          failure: {
            text: "She likes it and has no room: two graduate students, a proposal due, and a course she has not prepared. Send me what you find, she says, and means it, and the four weeks are gone by the time you start.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["met_okafor", "self_taught_start"]
          }
        }
      },
      {
        label: "Take the four weeks off",
        outcomes: {
          success: {
            text: "You sleep past nine for the first time since September and see people you have been ignoring since September. In January you have nothing to show anybody and you are not tired.",
            stat_deltas: {
              CH: 0.3
            },
            stress_delta: STRESS.REST,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["rested_once"]
          }
        }
      }
    ]
  },
  {
    id: "nc_solutions_folder",
    title: "The folder that goes around",
    text: "Somebody two years above kept every solution to the mechanics sets, and the folder is on a shared drive with your whole year in it. The sets are twenty percent of the grade and fourteen hours a week.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.COLLEGE],
    age_range: [18, 21],
    weight: 3,
    cooldown_years: 4,
    max_fires: 1,
    choices: [
      {
        label: "Do not open it",
        stat_check: {
          stats: ["GR", "SM"],
          modifier: -0.05
        },
        outcomes: {
          success: {
            text: "Fourteen hours a week, a good half of them spent stuck. Your marks sit four or five points under people who finish in four, and in June you are one of the two who get anywhere on the unseen question.",
            stat_deltas: {
              SM: 0.5,
              GR: 0.5
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["honest_operator"]
          },
          failure: {
            text: "You hand in two sets late and one not at all, and open the folder in week nine with the other three still to write. The rule lasted eight weeks and you are the only person who knows it existed.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["cut_a_corner"]
          }
        }
      },
      {
        label: "Open it only after you have tried",
        stat_check: {
          stats: ["GR"],
          modifier: -0.05
        },
        outcomes: {
          success: {
            text: "The rule is that nothing gets opened until you have written something down, and it holds for two terms. You get the answers and the ability to find them.",
            stat_deltas: {
              SM: 0.5,
              GR: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["checks_answers"]
          },
          failure: {
            text: "The rule holds until the week with three deadlines and a shift in it, and after that it does not. Good marks in June, and a gap you will meet again in the qualifying exams.",
            stat_deltas: {
              SM: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["cut_a_corner"]
          }
        }
      },
      {
        label: "Use it and get the evenings back",
        outcomes: {
          success: {
            text: "Four hours a week instead of fourteen, and the ten go into the lab, which is not nothing. In March there is a problem on the exam unlike anything in the folder.",
            stat_deltas: {
              IN: 0.3,
              CO: 0.3
            },
            stress_delta: STRESS.REST,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["cut_a_corner"]
          }
        }
      }
    ]
  },
  {
    id: "nc_missed_pump_down",
    title: "The shift you slept through",
    text: "Three nights on a problem set, and you sleep through your Saturday shift. The chamber sat up to air until Monday because nobody closed it, and the bakeout that gets it back into the low ten to the minus eight range costs a graduate student her Sunday and most of her Monday.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.COLLEGE],
    age_range: [19, 22],
    weight: 2,
    cooldown_years: 3,
    max_fires: 1,
    choices: [
      {
        label: "Say it before anyone asks",
        stat_check: {
          stats: ["CH", "GR"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "You find her on Monday morning and say it plainly, without the sentence about the problem set. She is annoyed for a day and then puts you on the key list, which she did not have to do and which nobody else in your year is on.",
            stat_deltas: {
              CH: 0.5,
              GR: 0.5
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["honest_operator", "owns_mistakes"]
          },
          failure: {
            text: "She has already closed the log and does not especially want it reopened in front of her supervisor. You have the conversation anyway. It is worse than it needed to be, and it is on the record now.",
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
        label: "Let the log stand",
        outcomes: {
          success: {
            text: "The rota on the wall is a week out of date and the log blames the rota. Nobody corrects it. You keep the Saturday slot and take every one going for the rest of the year, and by March you can run a bakeout without the checklist. She still tells people it was the sign-up sheet.",
            stat_deltas: {
              IN: 0.5,
              GR: 0.3
            },
            stress_delta: STRESS.RELATIONSHIP_CONFLICT,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["looked_away_once"]
          }
        }
      }
    ]
  },
  {
    id: "nc_shop_certification",
    title: "Lathe and mill, Tuesdays",
    text: "The student shop runs a certification on the lathe and the mill: four hours a week for a term, no credit, taught by a machinist who has been there thirty years. It sits exactly on top of mathematical methods.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.COLLEGE],
    age_range: [18, 21],
    weight: 2,
    cooldown_years: 4,
    max_fires: 1,
    choices: [
      {
        label: "Take the certification",
        stat_check: {
          stats: ["GR", "IN"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "You come out signed off on both machines. Three years from now you cut your own probe holder on a Saturday instead of waiting six weeks for the shop queue, and you skip half the methods course to do it.",
            stat_deltas: {
              IN: 0.5,
              GR: 0.5
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["can_machine"]
          },
          failure: {
            text: "You scrap two pieces of stock and the machinist is patient in a way that is worse than shouting. He signs you off on the lathe and not the mill, and you have missed a term of methods for half a certificate.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["tried_the_shop"]
          }
        }
      },
      {
        label: "Take methods properly instead",
        outcomes: {
          success: {
            text: "Contour integrals, Green's functions, and a term of the kind of fluency that makes every later course cheaper. When you need a part made you will fill in a form and wait, like everyone else.",
            stat_deltas: {
              SM: 0.8
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["strong_methods"]
          }
        }
      }
    ]
  },
  {
    id: "ng_advisor_leaves",
    title: "Your advisor takes the offer",
    text: "A directorship in another country, starting in eight months. You can follow, on a visa and a funding line that does not exist yet, or stay and be handed to whoever in the department has capacity.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.GRAD_SCHOOL],
    age_range: [23, 28],
    weight: 1,
    cooldown_years: 5,
    max_fires: 1,
    choices: [
      {
        label: "Follow them",
        stat_check: {
          stats: ["GR", "CO"],
          modifier: -0.05
        },
        outcomes: {
          success: {
            text: "You arrive with two suitcases and a project that survived the move mostly intact. The new group works in a language you learn on evenings you do not have.",
            stat_deltas: {
              GR: 0.5,
              IN: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              NET: 3
            },
            relationship_deltas: {},
            flags_set: ["followed_advisor"]
          },
          failure: {
            text: "The visa takes eleven months and the funding line never materialises. You go back with a half-finished chapter and a supervisor who is now six time zones away.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["advisor_remote"]
          }
        }
      },
      {
        label: "Stay and take the new supervisor",
        outcomes: {
          success: {
            text: "He inherits you the way people inherit furniture. He signs what needs signing and reads none of it, and the thesis becomes entirely yours a year earlier than it should have. Nobody outside the building ever hears your name attached to it.",
            stat_deltas: {
              SM: 0.3,
              GR: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["orphaned_student", "self_directed"]
          }
        }
      },
      {
        label: "Finish remotely, on your own schedule",
        stat_check: {
          stats: ["GR", "SM"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "Calls at seven in the morning, one flight a year, and nobody in the building who notices whether you come in. You finish four months early, largely because there is nothing else to do.",
            stat_deltas: {
              GR: 0.8,
              SM: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 2
            },
            relationship_deltas: {},
            flags_set: ["finished_remote"]
          },
          failure: {
            text: "The calls slip to fortnightly, then monthly, then to a shared document neither of you opens. You lose a year to not being anyone's priority, including your own.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["advisor_remote"]
          }
        }
      }
    ]
  },
  {
    id: "ng_shot_list",
    title: "Which end of the run day",
    text: "Petrov gives you one hour on the compact tokamak on Thursday and lets you pick where in the day it sits. The first hour after the overnight glow discharge, walls clean and cold and the machine not yet behaving, or the last hour, walls hot and fully conditioned and the recycling fighting your density control.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.GRAD_SCHOOL],
    age_range: [23, 29],
    weight: 4,
    cooldown_years: 2,
    max_fires: 3,
    choices: [
      {
        label: "Take the first hour, on cold walls",
        stat_check: {
          stats: ["IN", "SM"],
          modifier: -0.05
        },
        outcomes: {
          success: {
            text: "Clean walls pump, and for four shots the density sits exactly where you put it. Two of the six never break down, which is what the first hour costs you and what it is worth.",
            stat_deltas: {
              IN: 0.5,
              SM: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: 2
            },
            relationship_deltas: {
              npc_petrov: RELD.COLLABORATED
            },
            flags_set: ["clean_wall_scan"]
          },
          failure: {
            text: "Breakdown fails on the first three attempts and the cure is patience you do not have an hour of. You come out with two usable shots at one density, which is a point and not a scan.",
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
        label: "Take the last hour, on conditioned walls",
        stat_check: {
          stats: ["GR", "CO"],
          modifier: -0.05
        },
        outcomes: {
          success: {
            text: "Hot walls, recycling you have to fight the whole time, and six shots that repeat each other to inside the shot to shot scatter. Narrow range, and the smallest error bars anyone in the group has put on that measurement.",
            stat_deltas: {
              SM: 0.5,
              GR: 0.5
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 2,
              NET: 1
            },
            relationship_deltas: {
              npc_petrov: RELD.COLLABORATED
            },
            flags_set: ["worked_the_margins"]
          },
          failure: {
            text: "The group before you overruns by fifty minutes and nobody is going to stop them at that hour. You get two shots at a density you did not choose. The walls were the only part of the evening that performed.",
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
        label: "Split it, half an hour at each end",
        outcomes: {
          success: {
            text: "Three shots cold and three shots hot. Between the two halves the wall condition changed by more than anything you were deliberately varying, so you have six good shots and nothing to compare them with.",
            stat_deltas: {
              GR: 0.3,
              IN: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["split_the_slot"]
          }
        }
      }
    ]
  },
  {
    id: "ng_wont_reproduce",
    title: "It worked in March",
    text: "The effect was there for six weeks and has not been since. Same machine, same settings, same analysis chain, and a plot that used to have a bump in it.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.GRAD_SCHOOL],
    age_range: [24, 29],
    weight: 3,
    cooldown_years: 3,
    max_fires: 2,
    choices: [
      {
        label: "Tear the analysis down to raw data",
        stat_check: {
          stats: ["SM", "GR"],
          modifier: -0.05
        },
        outcomes: {
          success: {
            text: "Four months, one line of code. A timestamp offset in the March calibration file that put the gas puff in the wrong place. The effect was never there, and now you are the only person who knows why.",
            stat_deltas: {
              SM: 0.8,
              GR: 0.5
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              SCI: 1
            },
            relationship_deltas: {},
            flags_set: ["found_the_bug", "honest_operator"]
          },
          failure: {
            text: "Four months and no answer. You cannot make it come back and you cannot make it go away, and the chapter now contains a paragraph you are not proud of.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["unresolved_result"]
          }
        }
      },
      {
        label: "Rebuild the March conditions exactly",
        stat_check: {
          stats: ["IN"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "You reconstruct everything: wall conditioning, days since boronisation, which turbo pump was down that week. It comes back, weakly, and the condition list is now the actual result.",
            stat_deltas: {
              IN: 0.8
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 3
            },
            relationship_deltas: {},
            flags_set: ["rebuilt_the_conditions"]
          },
          failure: {
            text: "You match March in every respect you can measure and the bump does not return. Somewhere there is a variable nobody is recording, and you will not find it before you have to graduate.",
            stat_deltas: {
              GR: 0.5,
              IN: 0.3
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["unresolved_result"]
          }
        }
      },
      {
        label: "Write it up with the caveat and move on",
        outcomes: {
          success: {
            text: "One honest sentence in the methods about non-reproducibility, correctly placed and easily missed. It is defensible, and it sits at the back of your head for years.",
            stat_deltas: {
              SM: 0.3
            },
            stress_delta: STRESS.REST,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["left_it_open"]
          }
        }
      }
    ]
  },
  {
    id: "ng_dead_year",
    title: "The year nothing works",
    text: "A quench in February, a diagnostic rebuild that ate the summer, and an autumn campaign that produced nothing you can publish. Your cohort is writing.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.GRAD_SCHOOL],
    age_range: [25, 29],
    weight: 2,
    cooldown_years: 4,
    max_fires: 1,
    choices: [
      {
        label: "Keep going. This is what the fourth year is.",
        stat_check: {
          stats: ["GR"],
          modifier: -0.05
        },
        outcomes: {
          success: {
            text: "You show up every day to a machine that owes you nothing. In November the cryopump comes back and you take four weeks of data that hold up. Nobody hands out credit for the eight months before that.",
            stat_deltas: {
              GR: 0.8
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 1
            },
            relationship_deltas: {},
            flags_set: ["survived_dead_year"]
          },
          failure: {
            text: "You show up every day and the machine stays broken. By March you are putting in eleven hours of something that is not quite work, and you could not say afterwards which of those hours counted.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["survived_dead_year"]
          }
        }
      },
      {
        label: "Take three weeks off, properly",
        outcomes: {
          success: {
            text: "You leave the laptop and go somewhere with unreliable signal. You come back to the same problems and a different amount of tolerance for them.",
            stat_deltas: {
              GR: 0.3,
              IN: 0.3
            },
            stress_delta: STRESS.REST,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["took_the_break"]
          }
        }
      },
      {
        label: "Change the question to fit the data you have",
        stat_check: {
          stats: ["IN", "SM"],
          modifier: -0.05
        },
        outcomes: {
          success: {
            text: "You stop trying to measure the thing and start measuring why it cannot be measured on this machine. It is a smaller thesis and a real one, and the framing is better than the original.",
            stat_deltas: {
              IN: 0.5,
              SM: 0.5
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {
              SCI: 2
            },
            relationship_deltas: {},
            flags_set: ["reframed_thesis"]
          },
          failure: {
            text: "The new question needs the same diagnostic as the old one. It takes six months to establish that, and they are the same six months either way.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: []
          }
        }
      }
    ]
  },
  {
    id: "ng_masters_exit",
    title: "The conversation about leaving",
    text: "Four and a half years in, no defence date, and a friend from your cohort who left with a master's two years ago and now sleeps eight hours a night. The department would sign the paperwork this week.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.GRAD_SCHOOL],
    age_range: [25, 29],
    weight: 2,
    cooldown_years: 5,
    max_fires: 1,
    choices: [
      {
        label: "Set a defence date and hold to it",
        stat_check: {
          stats: ["GR"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "You put a date on the whiteboard in permanent marker and tell three people. It is eighteen months out, and it is the first thing in two years that has not moved.",
            stat_deltas: {
              GR: 0.8
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["set_defence_date"]
          },
          failure: {
            text: "The date moves twice, both times for reasons that are genuinely good. The third time, you stop telling people.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["date_slipped"]
          }
        }
      },
      {
        label: "Ask your advisor for an honest assessment",
        stat_check: {
          stats: ["CH"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "\"You are eleven months out, and you have been for a while, because you keep adding.\" It is the most useful forty seconds of your doctorate.",
            stat_deltas: {
              SM: 0.3,
              GR: 0.5
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["knows_where_it_ends"]
          },
          failure: {
            text: "You get encouragement instead of an assessment. It is kindly meant and entirely useless, and you leave the office no closer to a date than you went in.",
            stat_deltas: {},
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: []
          }
        }
      },
      {
        label: "Look up the requirements and say nothing",
        outcomes: {
          success: {
            text: "You read the master's exit page once, late, and close the tab without telling anyone. Nothing about the work changes. You now know what the door costs and roughly where it is.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.REST,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["considered_leaving"]
          }
        }
      }
    ]
  },
  {
    id: "ng_conference_nobody",
    title: "Nine hundred people, none of whom know you",
    text: "Your first big international meeting. Your poster is in the last row of the Thursday session, and Nakamura, whose papers are a third of your bibliography, is standing alone by the coffee.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.GRAD_SCHOOL],
    age_range: [23, 29],
    weight: 3,
    cooldown_years: 3,
    max_fires: 2,
    choices: [
      {
        label: "Go and introduce yourself",
        stat_check: {
          stats: ["CH"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "You have ninety seconds of material and use sixty. He asks what your error bars are doing at low density, then comes to your poster on Thursday, which almost nobody does.",
            stat_deltas: {
              CH: 0.5,
              CO: 0.5
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              NET: 3
            },
            relationship_deltas: {
              npc_nakamura: RELD.SPOKE_WELL
            },
            flags_set: ["met_nakamura", "first_big_meeting"]
          },
          failure: {
            text: "You get out your name and your institution before somebody more senior arrives and the conversation closes over you. You stand there a moment holding a coffee you did not want.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["froze_once", "first_big_meeting"]
          }
        }
      },
      {
        label: "Work your poster the whole session",
        stat_check: {
          stats: ["GR", "CH"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "Four hours on your feet in the last row. Eleven people stop, two of them properly, and one of those two emails in September about a collaboration.",
            stat_deltas: {
              CH: 0.3,
              CO: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              NET: 2
            },
            relationship_deltas: {},
            flags_set: ["first_big_meeting"]
          },
          failure: {
            text: "Four hours on your feet in the last row. Three people stop, two of them on their way to the coffee. You are still standing there when they start taking the boards down.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["first_big_meeting"]
          }
        }
      },
      {
        label: "Sit in the talks and take notes",
        outcomes: {
          success: {
            text: "You attend everything, follow about half, and write down four things nobody in your group knows yet. You go home with no contacts and a better map of the field than you arrived with.",
            stat_deltas: {
              SM: 0.3,
              IN: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["first_big_meeting"]
          }
        }
      }
    ]
  },
  {
    id: "ng_advisor_is_wrong",
    title: "The model does not hold",
    text: "Three weeks with Okafor's transport model and a fortnight of your own data, and the two stop agreeing above a certain density. She has been defending that model in print for nine years.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.GRAD_SCHOOL],
    age_range: [24, 29],
    weight: 2,
    cooldown_years: 4,
    max_fires: 1,
    choices: [
      {
        label: "Show her, with the plots",
        stat_check: {
          stats: ["SM", "CH"],
          modifier: -0.05
        },
        outcomes: {
          success: {
            text: "She looks at it for a long time and says, \"Well. That is annoying.\" Two months later the correction is a joint paper and she puts your name first.",
            stat_deltas: {
              SM: 0.5,
              CH: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: 4
            },
            relationship_deltas: {
              npc_okafor: RELD.COLLABORATED
            },
            flags_set: ["challenged_advisor"]
          },
          failure: {
            text: "She finds the hole in your uncertainty budget in about four minutes, and she is right about it. You spend six weeks closing it, and the disagreement is still there when you are done.",
            stat_deltas: {
              GR: 0.5,
              SM: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {
              npc_okafor: RELD.DISAGREED
            },
            flags_set: []
          }
        }
      },
      {
        label: "Check it three more ways first",
        stat_check: {
          stats: ["GR", "SM"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "Two more diagnostics and an independent analysis chain, and the disagreement survives all of it. When you finally take it to her there is nothing left to argue about except what it means.",
            stat_deltas: {
              SM: 0.5,
              GR: 0.5
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 2
            },
            relationship_deltas: {
              npc_okafor: RELD.COLLABORATED
            },
            flags_set: ["checked_it_properly", "honest_operator"]
          },
          failure: {
            text: "The third check finds your own error: a channel with a bad gain you have been carrying since March. Nobody else ever saw it, which is the only mercy in it.",
            stat_deltas: {
              GR: 0.5,
              IN: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["found_own_error"]
          }
        }
      },
      {
        label: "Bury it in a footnote",
        outcomes: {
          success: {
            text: "One line, past tense, in a section nobody reads: consistent within the stated uncertainties. It is not false, and you know exactly which word is carrying it. The chapter goes to the committee in March instead of September and Okafor signs it without stopping.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["stretched_a_claim"]
          }
        }
      }
    ]
  },
  {
    id: "ng_inherited_code",
    title: "The code you inherited",
    text: "The group's equilibrium reconstruction was written by Kaur, who left for a national lab years ago and commented nothing. You have found something in it that looks wrong, and four published papers depend on it.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.GRAD_SCHOOL],
    age_range: [24, 29],
    weight: 2,
    cooldown_years: 4,
    max_fires: 1,
    choices: [
      {
        label: "Rewrite it properly and validate",
        stat_check: {
          stats: ["SM", "GR"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "Seven months of a doctorate spent on infrastructure. The bug was real, small, and changed none of the published results, and the group runs your version for the next fifteen years.",
            stat_deltas: {
              SM: 0.5,
              GR: 0.8
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 2,
              NET: 2
            },
            relationship_deltas: {
              npc_kaur: RELD.COLLABORATED
            },
            flags_set: ["fixed_the_pipeline"]
          },
          failure: {
            text: "Eight months in, yours still does not match hers on the benchmark shots. You revert, keep your version in a branch, and never quite trust either one again.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["pipeline_unresolved"]
          }
        }
      },
      {
        label: "Email Kaur and ask",
        stat_check: {
          stats: ["CH"],
          modifier: 0.1
        },
        outcomes: {
          success: {
            text: "She replies in two days with a paragraph and an apology for the state of it. A sign convention, documented nowhere, harmless to the papers. Twenty minutes of her time saved you half a year.",
            stat_deltas: {
              CO: 0.5,
              SM: 0.3
            },
            stress_delta: STRESS.REST,
            reputation_deltas: {
              NET: 2
            },
            relationship_deltas: {
              npc_kaur: RELD.HELPED
            },
            flags_set: ["asked_for_help"]
          },
          failure: {
            text: "No reply. You send a second one in November, more polite than you feel, and get an out of office. The question stays open and so does the branch.",
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
        label: "Work around it and finish your chapter",
        outcomes: {
          success: {
            text: "You restrict the analysis to the regime where it cannot matter, and say so once, clearly. It is defensible, it is documented, and it is somebody else's problem now.",
            stat_deltas: {
              SM: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["worked_around_it"]
          }
        }
      }
    ]
  },
  {
    id: "ng_disruption_tile",
    title: "The vertical control has been fighting you all night",
    text: "Four shots left of a slot you waited five months for, on a spherical tokamak whose plasma has drifted upward on every one so far. Reyes is the duty engineer and has already asked twice what your elongation is set to.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.GRAD_SCHOOL],
    age_range: [23, 29],
    weight: 2,
    cooldown_years: 3,
    max_fires: 1,
    choices: [
      {
        label: "Run the shape you came for",
        stat_check: {
          stats: ["IN", "GR"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "Two shots at elongation 2.1, the control coil current inside its limit for about a second and a half of each. It is the only measurement in the thesis that nobody else has taken.",
            stat_deltas: {
              IN: 0.8,
              GR: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 3
            },
            relationship_deltas: {},
            flags_set: ["ran_the_hard_shape"]
          },
          failure: {
            text: "The third shot goes vertically unstable at 240 milliseconds and the halo current comes out through the upper divertor supports. The machine is down a week for checks and Reyes writes the report himself.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              SCI: -1
            },
            relationship_deltas: {
              npc_reyes: RELD.DISAGREED
            },
            flags_set: ["machine_down"]
          }
        }
      },
      {
        label: "Back off to a shape that sits still",
        outcomes: {
          success: {
            text: "Elongation 1.8, four plasmas that go where you put them, and a measurement that answers a slightly different question than the one you asked. It goes in the thesis with a paragraph explaining why.",
            stat_deltas: {
              GR: 0.3,
              SM: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["took_the_safe_shape"]
          }
        }
      },
      {
        label: "Ask Reyes to retune the vertical control gains now",
        stat_check: {
          stats: ["CH", "CO"],
          modifier: -0.05
        },
        outcomes: {
          success: {
            text: "He is irritated for ten minutes and interested for the next two hours. You spend two of your four shots on his test cases and come out with a control setup that holds for the rest of your doctorate, and he starts telling you things before you ask.",
            stat_deltas: {
              CO: 0.5,
              CH: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              NET: 2
            },
            relationship_deltas: {
              npc_reyes: RELD.COLLABORATED
            },
            flags_set: ["asked_for_help", "escalated_early"]
          },
          failure: {
            text: "He will not touch a certified system at four in the morning, and he is right not to. You lose the argument, most of the hour, and two of the four shots.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {
              npc_reyes: RELD.DISAGREED
            },
            flags_set: []
          }
        }
      }
    ]
  },
  {
    id: "ng_labmate_deadline",
    title: "Varga has ten days",
    text: "R\u00e9ka defends in ten days and her final chapter will not compile, in every sense of the word. You are the only person in the group who knows both the code and her data, and your beam time is on Thursday.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.GRAD_SCHOOL],
    age_range: [24, 29],
    weight: 3,
    cooldown_years: 3,
    max_fires: 2,
    choices: [
      {
        label: "Give her the week, reschedule your run",
        outcomes: {
          success: {
            text: "She defends. You give up the slot and wait five months for the next one, and those five months come off the end of your own degree. At the party she says the thing about you that people usually only put in acknowledgements.",
            stat_deltas: {
              CH: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {},
            relationship_deltas: {
              npc_varga: RELD.HELPED
            },
            flags_set: ["helped_labmate"]
          }
        }
      },
      {
        label: "Two evenings, then your own run",
        stat_check: {
          stats: ["SM", "GR"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "You find it on the second evening at eleven o'clock, hand it back, and are in the control room on Thursday as planned. Both of you get what you needed, narrowly, and she says so to people who matter.",
            stat_deltas: {
              SM: 0.5,
              GR: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              NET: 2
            },
            relationship_deltas: {
              npc_varga: RELD.COLLABORATED
            },
            flags_set: ["helped_labmate"]
          },
          failure: {
            text: "Two evenings is not enough, and you leave her mid-problem to take your slot. She defends four months later than planned, and neither of you mentions that week again.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.RELATIONSHIP_CONFLICT,
            reputation_deltas: {},
            relationship_deltas: {
              npc_varga: RELD.IGNORED
            },
            flags_set: []
          }
        }
      },
      {
        label: "Send her the documentation and take your run",
        stat_check: {
          stats: ["SM", "IN"],
          modifier: -0.05
        },
        outcomes: {
          success: {
            text: "Four careful paragraphs written at midnight, and your Thursday intact. She finds it herself on the Tuesday, defends on schedule, and thanks you in a tone that is accurate rather than warm.",
            stat_deltas: {
              IN: 0.5,
              GR: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              NET: 1
            },
            relationship_deltas: {
              npc_varga: RELD.COLLABORATED
            },
            flags_set: ["wrote_it_down"]
          },
          failure: {
            text: "The documentation assumes three things she does not know, and by the time she works that out it is Sunday. You had your run. She moves her defence, and the group notices which of those two facts you chose.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.RELATIONSHIP_CONFLICT,
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
    id: "ng_recruiter_call",
    title: "Employee sixty",
    text: "Lindgren's compact tokamak company has forty people, a leased hangar, and a divertor they cannot instrument. Somebody gave her your name. The job starts in four months, needs no doctorate, and would put your probe array on a machine scheduled for first plasma in two years.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.GRAD_SCHOOL],
    age_range: [23, 29],
    weight: 3,
    cooldown_years: 3,
    max_fires: 2,
    choices: [
      {
        label: "Ask them to hold the role until you defend",
        stat_check: {
          stats: ["CH", "CO"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "She says four months is negotiable and eighteen is not, which is at least a number you can work against. You defend fourteen months later and the role is still there, one level below the one she first described.",
            stat_deltas: {
              CO: 0.5,
              CH: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              NET: 2
            },
            relationship_deltas: {
              npc_lindgren: RELD.SPOKE_WELL
            },
            flags_set: ["industry_door_open"]
          },
          failure: {
            text: "They hire a vacuum engineer with two years of hardware behind her, in March. The email is warm and final. It is not personal, and it does not feel that way.",
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
        label: "Take it, and finish the thesis at night",
        stat_check: {
          stats: ["GR", "SM"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "Ten hours in the hangar and two at the kitchen table, for nineteen months. The thesis is thinner than the one you meant to write, and it is submitted, and you are in the room when the probes see plasma.",
            stat_deltas: {
              GR: 0.8,
              IN: 0.5
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              NET: 3,
              SCI: 1
            },
            relationship_deltas: {
              npc_lindgren: RELD.CHOSE_THEM
            },
            flags_set: ["finished_while_working"]
          },
          failure: {
            text: "The chapters stop moving in the second month and do not start again. You are good at the job. Your committee stops asking about the thesis, which is worse than being asked.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              SCI: -1
            },
            relationship_deltas: {},
            flags_set: ["thesis_stalled"]
          }
        }
      },
      {
        label: "Say no and stay with the machine you have",
        outcomes: {
          success: {
            text: "You answer inside the hour and go back to the analysis. Their build photos come past every few months, and you read those more carefully than you read anything else that year.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["stayed_the_course"]
          }
        }
      }
    ]
  },
  {
    id: "ng_extra_chapter",
    title: "One more chapter",
    text: "Ninety minutes of committee, and Oyelaran, who has said almost nothing in three years, says the thesis needs the neutron transport comparison to stand up. He is not wrong. It is another eight months.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.GRAD_SCHOOL],
    age_range: [25, 29],
    weight: 3,
    cooldown_years: 3,
    max_fires: 1,
    choices: [
      {
        label: "Write the chapter",
        stat_check: {
          stats: ["GR", "SM"],
          modifier: -0.05
        },
        outcomes: {
          success: {
            text: "Eight months, one chapter, and the only part of the thesis anyone cites in the ten years after. Oyelaran writes a reference letter that is specific in the way letters almost never are.",
            stat_deltas: {
              SM: 0.5,
              GR: 0.5
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 3
            },
            relationship_deltas: {
              npc_oyelaran: RELD.SPOKE_WELL
            },
            flags_set: ["did_the_extra_chapter"]
          },
          failure: {
            text: "You write it late and badly, arguing with it the whole way. It goes in as an appendix nobody reads: eight months spent, one paragraph gained.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: []
          }
        }
      },
      {
        label: "Argue the scope, with your advisor behind you",
        stat_check: {
          stats: ["CH", "CO"],
          modifier: -0.05
        },
        outcomes: {
          success: {
            text: "Your advisor backs you in the room and the committee settles for a section instead of a chapter. You defend in the spring. The thesis is thinner and it is finished.",
            stat_deltas: {
              CH: 0.5
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {},
            relationship_deltas: {
              npc_oyelaran: RELD.DISAGREED
            },
            flags_set: ["defended_scope"]
          },
          failure: {
            text: "The committee closes ranks the way committees do. You write the chapter anyway, four months later than if you had simply started it in the room.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {
              npc_oyelaran: RELD.DISAGREED
            },
            flags_set: []
          }
        }
      },
      {
        label: "Ask him to co-supervise it",
        stat_check: {
          stats: ["CH", "CO"],
          modifier: -0.05
        },
        outcomes: {
          success: {
            text: "He says yes immediately, and it becomes clear he has been waiting three years to be asked. The chapter takes ten months, and for the next decade he answers your emails inside a day.",
            stat_deltas: {
              CO: 0.5,
              SM: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              NET: 3
            },
            relationship_deltas: {
              npc_oyelaran: RELD.CHOSE_THEM
            },
            flags_set: ["second_supervisor"]
          },
          failure: {
            text: "He says yes and then rebuilds the chapter twice, both times for reasons he is right about. Fourteen months instead of eight, a better chapter, and about a third of it is his.",
            stat_deltas: {
              GR: 0.5,
              SM: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              NET: 1
            },
            relationship_deltas: {
              npc_oyelaran: RELD.COLLABORATED
            },
            flags_set: ["second_supervisor"]
          }
        }
      }
    ]
  },
  {
    id: "ng_first_talk",
    title: "Twelve minutes, contributed session",
    text: "Your first talk: twelve minutes and three for questions, in a room of forty, at nine in the morning on the last day. Bello is in the second row because the next talk is his.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.GRAD_SCHOOL],
    age_range: [23, 29],
    weight: 4,
    cooldown_years: 2,
    max_fires: 2,
    choices: [
      {
        label: "Present the clean result and stop early",
        stat_check: {
          stats: ["CH"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "You finish in ten and take five questions instead of three. Bello asks the hardest one and then nods at the answer, which two people afterwards tell you almost never happens.",
            stat_deltas: {
              CH: 0.5,
              SM: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: 2
            },
            relationship_deltas: {
              npc_bello: RELD.SPOKE_WELL
            },
            flags_set: ["first_talk"]
          },
          failure: {
            text: "You read your slides. The room is polite, the questions are procedural, and you spend the flight home rehearsing the version you should have given.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["first_talk"]
          }
        }
      },
      {
        label: "Show the part that does not work",
        stat_check: {
          stats: ["IN", "CH"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "You put the non-reproducing run in the middle of the talk and say plainly that you do not understand it. Three people find you at lunch, and one of them has seen the same thing on a different machine.",
            stat_deltas: {
              IN: 0.5,
              CO: 0.5
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: 3,
              NET: 2
            },
            relationship_deltas: {},
            flags_set: ["first_talk", "showed_the_mess", "honest_operator"]
          },
          failure: {
            text: "The messy slide takes seven of your twelve minutes and you never reach the result. Somebody asks, kindly, what your conclusion was, and you find you do not have one ready.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["first_talk"]
          }
        }
      }
    ]
  },
  {
    id: "ng_calibration_drift",
    title: "The window has been coating over since March",
    text: "You maintain the Thomson scattering system. Friday's spectral calibration says the collection optics have lost eleven percent transmission over fourteen months of boronisation, and the coating is not grey: it takes more from the short wavelength channels than the long ones, so the fitted temperatures come out low by five to nine percent. The interferometer is clean, because interferometers either jump a whole fringe or they do not. Four people are writing with that data and one is in review.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.GRAD_SCHOOL],
    age_range: [24, 29],
    weight: 2,
    cooldown_years: 4,
    max_fires: 1,
    choices: [
      {
        label: "Put it in front of the group on Monday",
        stat_check: {
          stats: ["CH", "SM"],
          modifier: -0.05
        },
        outcomes: {
          success: {
            text: "Transmission curve first, corrected temperatures second, and nobody argues with either. Okafor asks you to write the recalibration note, which is the least glamorous authorship in the group and the one every one of them has to cite.",
            stat_deltas: {
              SM: 0.5,
              CH: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              SCI: 2,
              NET: 1
            },
            relationship_deltas: {
              npc_okafor: RELD.COLLABORATED
            },
            flags_set: ["wrote_the_note", "honest_operator"]
          },
          failure: {
            text: "You raise it before you have the wavelength dependence nailed and the postdoc takes it apart in four minutes, correctly. The correction goes in anyway in September, done by somebody else, with a number close to yours.",
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
        label: "Pin it against the interferometer first",
        stat_check: {
          stats: ["SM", "GR"],
          modifier: -0.05
        },
        outcomes: {
          success: {
            text: "Two weeks comparing the Thomson density profile integral against the interferometer line integral, shot by shot, back to the boronisation. The correction curve you produce is what the group uses for the next six years.",
            stat_deltas: {
              SM: 0.8,
              GR: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 3
            },
            relationship_deltas: {},
            flags_set: ["documented_it", "honest_operator"]
          },
          failure: {
            text: "The paper in review is accepted in the fortnight you spend checking. It is a published number now rather than a draft one, and the conversation you have to have has changed shape.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["filed_correction"]
          }
        }
      },
      {
        label: "Patch the calibration file and email the four of them",
        outcomes: {
          success: {
            text: "Four emails, one attached file, no meeting. Three of them reprocess without comment. The postdoc does not reply, and nobody outside the group ever learns where the correction came from.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.REST,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["corrected_quietly"]
          }
        }
      }
    ]
  },
  {
    id: "ne_postdoc_third_year",
    title: "The third year of a two-year contract",
    text: "Your postdoc renews again, quietly, the way these things do. Reyes mentions a permanent staff line opening in her materials group: pensioned, adjacent to your field, and not your field.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.EARLY_CAREER],
    age_range: [28, 33],
    weight: 3,
    cooldown_years: 4,
    max_fires: 1,
    choices: [
      {
        label: "Take the staff line",
        outcomes: {
          success: {
            text: "Permanent, and eleven metres down the corridor from the work you actually wanted. You stop reading job listings in January, which is a relief you did not expect to resent.",
            stat_deltas: {
              CO: 0.5,
              GR: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              NET: 2
            },
            relationship_deltas: {
              npc_reyes: RELD.CHOSE_THEM
            },
            flags_set: ["took_staff_line"]
          }
        }
      },
      {
        label: "Renew, and go on the market properly",
        stat_check: {
          stats: ["SM", "CO"],
          modifier: -0.05
        },
        outcomes: {
          success: {
            text: "Forty applications, three interviews, one offer, and it is a real one. You accept it standing in a corridor on your phone and then sit down for a while.",
            stat_deltas: {
              SM: 0.5,
              CO: 0.5
            },
            stress_delta: STRESS.MAJOR_SUCCESS,
            reputation_deltas: {
              SCI: 3,
              NET: 3
            },
            relationship_deltas: {},
            flags_set: ["got_first_position"]
          },
          failure: {
            text: "Forty applications, two interviews, no offers. The rejections are all versions of the same sentence about fit, and the contract renews for a fourth year.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["market_year_lost"]
          }
        }
      }
    ]
  },
  {
    id: "ne_first_hire",
    title: "One salary line",
    text: "Three years of one position, and you can only fill it once. A postdoc would write papers. A technician would stop the vacuum system failing, which is the reason there are no papers.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.EARLY_CAREER],
    age_range: [30, 38],
    weight: 3,
    cooldown_years: 4,
    max_fires: 1,
    choices: [
      {
        label: "Hire the postdoc",
        stat_check: {
          stats: ["IN", "CO"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "He arrives with his own ideas and publishes four times in three years, two of them without being asked. The vacuum system still fails, and now it fails on somebody else's data as well.",
            stat_deltas: {
              SM: 0.3,
              CO: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 3
            },
            relationship_deltas: {},
            flags_set: ["hired_postdoc"]
          },
          failure: {
            text: "He is good and he is gone in fourteen months, to a position you would have taken too. You spend the remainder of the line advertising it.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["hired_postdoc"]
          }
        }
      },
      {
        label: "Hire the technician",
        outcomes: {
          success: {
            text: "Within a year the base pressure is where it should be and the machine runs on the day you said it would. Nothing you publish will mention it and everything you publish depends on it.",
            stat_deltas: {
              IN: 0.3,
              GR: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: 1
            },
            relationship_deltas: {},
            flags_set: ["hired_technician"]
          }
        }
      },
      {
        label: "Split it into two half-time posts",
        stat_check: {
          stats: ["CH"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "Both take the half line and top it up elsewhere, and against every expectation it holds. You spend a quarter of your week inside two other people's timetables and come out with two and a half days of technician and one paper you would not otherwise have had.",
            stat_deltas: {
              CH: 0.5,
              CO: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              NET: 3,
              SCI: 2
            },
            relationship_deltas: {},
            flags_set: ["split_the_line"]
          },
          failure: {
            text: "Two people on half salaries are two people looking for full ones. Both are gone inside eighteen months and the line reverts to the department.",
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
    id: "ne_saying_no",
    title: "Varga asks to be on the grant",
    text: "There is one postdoc line in the budget and it is already promised. R\u00e9ka has been between positions for seven months and is asking you directly, which she has never had to do before.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.EARLY_CAREER],
    age_range: [29, 38],
    weight: 3,
    cooldown_years: 3,
    max_fires: 1,
    choices: [
      {
        label: "Find room for her",
        stat_check: {
          stats: ["CH", "CO"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "You cut your own summer salary and defer a diagnostic upgrade to make the arithmetic work. She is on the grant, the upgrade waits two years, and neither of you mentions the salary.",
            stat_deltas: {
              CH: 0.3,
              CO: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              NET: 3
            },
            relationship_deltas: {
              npc_varga: RELD.HELPED
            },
            flags_set: ["made_room"]
          },
          failure: {
            text: "The panel reads the budget as thin for the scope and trims it further. She gets nine months instead of three years, which is worse than either version you were choosing between.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {
              npc_varga: RELD.HELPED
            },
            flags_set: []
          }
        }
      },
      {
        label: "Tell her no, in one sentence",
        outcomes: {
          success: {
            text: "You say it on the phone rather than in three paragraphs of email, which is the only kindness available. She takes an industry post that autumn and answers you a little slower for a few years.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.RELATIONSHIP_CONFLICT,
            reputation_deltas: {},
            relationship_deltas: {
              npc_varga: RELD.DISAGREED
            },
            flags_set: ["said_no_first_time"]
          }
        }
      },
      {
        label: "Say you will see what you can do",
        stat_check: {
          stats: ["CH"],
          modifier: -0.05
        },
        outcomes: {
          success: {
            text: "She keeps sending you analysis through the spring on the strength of a sentence that meant nothing. Two of her figures go into the proposal and one of them is the reason it scores. She finds the abstract online in March and does not write back.",
            stat_deltas: {
              CO: 0.3
            },
            stress_delta: STRESS.RELATIONSHIP_CONFLICT,
            reputation_deltas: {
              SCI: 2,
              NET: -2
            },
            relationship_deltas: {
              npc_varga: RELD.IGNORED
            },
            flags_set: ["let_it_run"]
          },
          failure: {
            text: "She asks again in February, directly, and you have to say the thing you have been not saying since October. She tells two people how long you let it run, and both of them know you.",
            stat_deltas: {},
            stress_delta: STRESS.RELATIONSHIP_CONFLICT,
            reputation_deltas: {
              NET: -4
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
    id: "ne_referee_overlap",
    title: "The manuscript in your inbox",
    text: "An editor sends you a paper to referee. Forty minutes in you recognise it: the measurement you have been running since October, done first and done adequately.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.EARLY_CAREER],
    age_range: [29, 40],
    weight: 2,
    cooldown_years: 3,
    max_fires: 2,
    choices: [
      {
        label: "Declare the conflict and send it back",
        outcomes: {
          success: {
            text: "The editor thanks you in one line and finds somebody else. It publishes three weeks ahead of yours, and yours goes out as the second measurement of a thing that is now known.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {
              SCI: 1
            },
            relationship_deltas: {},
            flags_set: ["declared_conflict", "honest_operator"]
          }
        }
      },
      {
        label: "Review it properly and fast",
        stat_check: {
          stats: ["GR", "SM"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "Accept with two minor comments, returned in nine days, and a note to the editor saying you are running the same measurement on a different diagnostic. He puts the two papers back to back in the same issue and sends you four more manuscripts that year.",
            stat_deltas: {
              SM: 0.3,
              GR: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 3,
              NET: 3
            },
            relationship_deltas: {},
            flags_set: ["reviewed_it_straight"]
          },
          failure: {
            text: "You are fair and you are also slow, because you keep opening your own draft instead. The editor chases twice. The authors can read a date stamp as well as anyone.",
            stat_deltas: {},
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              SCI: -2,
              NET: -2
            },
            relationship_deltas: {},
            flags_set: []
          }
        }
      },
      {
        label: "Keep it, and get your preprint up tonight",
        stat_check: {
          stats: ["IN", "CO"],
          modifier: -0.15
        },
        outcomes: {
          success: {
            text: "The preprint is up inside seventy hours and the timestamps are, technically, in your favour. You are careful about who you tell, which is how you find out what you think of it.",
            stat_deltas: {
              CO: 0.5
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 2
            },
            relationship_deltas: {},
            flags_set: ["used_privileged_information"]
          },
          failure: {
            text: "The authors do the arithmetic on the dates and write to the editor. Nothing formal follows. The editor stops sending you manuscripts, and you notice how long it takes you to notice.",
            stat_deltas: {},
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              SCI: -4,
              NET: -4
            },
            relationship_deltas: {},
            flags_set: ["used_privileged_information"]
          }
        }
      }
    ]
  },
  {
    id: "ne_shot_list",
    title: "Five days of session leader time",
    text: "Five operating days on the stellarator, and the plan is yours to write. Petrov will hand back the pellet injector if you spend two of the days recommissioning it, which leaves three days of physics and fuelling data nobody has taken at this density.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.EARLY_CAREER],
    age_range: [29, 40],
    weight: 3,
    cooldown_years: 2,
    max_fires: 2,
    choices: [
      {
        label: "Run all five days on gas puffing",
        outcomes: {
          success: {
            text: "Twenty-eight discharges and a clean density scan with an actuator you understand completely. It is the paper you planned in March, and the pellet question stays open for whoever asks for the week after you.",
            stat_deltas: {
              GR: 0.3,
              SM: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: 2
            },
            relationship_deltas: {
              npc_petrov: RELD.COLLABORATED
            },
            flags_set: ["ran_the_safe_plan"]
          }
        }
      },
      {
        label: "Spend two days recommissioning the injector",
        stat_check: {
          stats: ["IN", "GR"],
          modifier: -0.05
        },
        outcomes: {
          success: {
            text: "The injector fires on the afternoon of day two. Nineteen pellets across the last three days, ablation profiles above the density the gas puff can reach, and Petrov puts his technician on the analysis without being asked.",
            stat_deltas: {
              IN: 0.8,
              GR: 0.3
            },
            stress_delta: STRESS.MAJOR_SUCCESS,
            reputation_deltas: {
              SCI: 5,
              NET: 2
            },
            relationship_deltas: {
              npc_petrov: RELD.COLLABORATED
            },
            flags_set: ["ran_the_pellets"]
          },
          failure: {
            text: "A cracked guide tube on the second barrel, found on day two and not fixable inside the week. You take eleven gas puff shots on the Friday and leave with a scan that stops short of the point it was for.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              SCI: -1
            },
            relationship_deltas: {
              npc_petrov: RELD.DISAGREED
            },
            flags_set: ["lost_the_week"]
          }
        }
      },
      {
        label: "Trade two days to the impurity transport group",
        stat_check: {
          stats: ["CH", "CO"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "They get their laser blow-off shots and you get their spectrometer, cross-calibrated, for the rest of the campaign. Three days is enough for the scan if nothing goes wrong, and nothing goes wrong.",
            stat_deltas: {
              CH: 0.5,
              CO: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: 2,
              NET: 4
            },
            relationship_deltas: {
              npc_petrov: RELD.COLLABORATED
            },
            flags_set: ["traded_beam_time"]
          },
          failure: {
            text: "Their blow-off laser misfires into the morning of day three and the recovery takes the rest of it. Nine usable discharges out of five days, and a favour owed to you by people with no beam time to give back.",
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
      }
    ]
  },
  {
    id: "ne_three_papers",
    title: "One paper or three",
    text: "The dataset will support three publishable units, or one paper that is actually about something. The committees you are applying to count the first kind and read the second kind rarely.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.EARLY_CAREER],
    age_range: [29, 39],
    weight: 3,
    cooldown_years: 3,
    max_fires: 2,
    choices: [
      {
        label: "Split it into three",
        outcomes: {
          success: {
            text: "Three papers in fourteen months, each citing the other two. The list reads correctly at a glance, which is how most panels will ever read it. The second one adds nothing to the first and you knew that while you were writing it.",
            stat_deltas: {
              CH: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 2,
              NET: 1
            },
            relationship_deltas: {},
            flags_set: ["split_the_dataset"]
          }
        }
      },
      {
        label: "Write the one that matters",
        stat_check: {
          stats: ["IN", "SM"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "Fourteen months and a single paper, and ten years later it is still being cited by people who were not in the field when you wrote it. It is not on your list in time for the search you were aiming at, and you go through that search three lines shorter than everybody else.",
            stat_deltas: {
              SM: 0.5,
              IN: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 5
            },
            relationship_deltas: {},
            flags_set: ["wrote_the_real_one"]
          },
          failure: {
            text: "Fourteen months, two rejections on scope, and it lands in a specialist journal in the twentieth. One line on the list where there could have been three, and the argument only reads as an argument to people who already agreed with it.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              SCI: 1
            },
            relationship_deltas: {},
            flags_set: ["wrote_the_real_one"]
          }
        }
      }
    ]
  },
  {
    id: "ne_leaving_the_field",
    title: "An offer with a start date",
    text: "Sandberg left the field four years ago and runs process development at an etch tool company. She has a named position for you, a defined problem in sheath-driven ion angular spread at high aspect ratio, and a start date eleven weeks out. Your fellowship decision comes in nine.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.EARLY_CAREER],
    age_range: [29, 38],
    weight: 2,
    cooldown_years: 5,
    max_fires: 1,
    choices: [
      {
        label: "Take the position",
        stat_check: {
          stats: ["CO", "IN"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "Eight weeks' notice, and a first year spent learning what a tool release schedule does to a research question. Three patents in four years and work that ships inside something people buy. The last fusion paper with your name on it is the one already in review.",
            stat_deltas: {
              CO: 0.5,
              IN: 0.3
            },
            stress_delta: STRESS.LIFE_EVENT,
            reputation_deltas: {
              NET: 3,
              SCI: -2
            },
            relationship_deltas: {},
            flags_set: ["left_the_field"]
          },
          failure: {
            text: "The programme you were hired for is cancelled in month nine and you are moved to metrology, which is a real job and not the one in the letter. Two years out, coming back means reading the postdoc listings again.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              SCI: -3,
              NET: -1
            },
            relationship_deltas: {},
            flags_set: ["left_the_field"]
          }
        }
      },
      {
        label: "Ask them to fund the same problem in your lab",
        stat_check: {
          stats: ["CH", "CO"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "A two-year sponsored research agreement at a hundred and eighty thousand a year, a student on their money, and a sixty-day review on anything you publish. You keep the position and the problem, and you sign a clause you would not have signed at thirty.",
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
            flags_set: ["industry_money"]
          },
          failure: {
            text: "Six weeks of lawyers arguing about background intellectual property, and it dies over publication rights. The start date passes, the fellowship decision arrives, and Sandberg fills the position with somebody from Eindhoven.",
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
        label: "Decline before the fellowship decision",
        outcomes: {
          success: {
            text: "You answer in three sentences and do not ask what the number was. Two years later somebody who took a similar offer tells you over a bad conference dinner, and you spend the rest of the evening being pleasant.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["stayed_in_field"]
          }
        }
      }
    ]
  },
  {
    id: "ne_startup_package",
    title: "The part of the offer that is negotiable",
    text: "The position is real and three of its numbers are not final: the startup funds, the lab space, the teaching relief. The chair has made it clear, pleasantly, that you can push on one.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.EARLY_CAREER],
    age_range: [30, 38],
    weight: 3,
    cooldown_years: 5,
    max_fires: 1,
    choices: [
      {
        label: "Push for the money",
        outcomes: {
          success: {
            text: "Another eighty thousand, which is the number the chair had decided on before you walked in. It buys a second-hand vessel or a year of a student, and not both.",
            stat_deltas: {
              CO: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              NET: 1
            },
            relationship_deltas: {},
            flags_set: ["pushed_for_money"]
          }
        }
      },
      {
        label: "Push for the space",
        stat_check: {
          stats: ["CH", "CO"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "The corner bay with the crane and the three-phase supply, taken off a group that had not used it in two years. For the first year it is an empty room you cannot afford to fill. The first thing you build in it takes four years and works.",
            stat_deltas: {
              IN: 0.5,
              CO: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: 3,
              NET: 2
            },
            relationship_deltas: {},
            flags_set: ["pushed_for_space"]
          },
          failure: {
            text: "The bay stays with the group that already had it and you take the room you were first offered, with a two point four metre ceiling and no crane. The chair mentions, once, that you asked.",
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
        label: "Push for the teaching relief",
        stat_check: {
          stats: ["CH"],
          modifier: 0.1
        },
        outcomes: {
          success: {
            text: "Two years of clear mornings. You use most of them, which is not guaranteed, and the second proposal you write in one is funded.",
            stat_deltas: {
              SM: 0.3,
              GR: 0.3
            },
            stress_delta: STRESS.REST,
            reputation_deltas: {
              SCI: 2
            },
            relationship_deltas: {},
            flags_set: ["pushed_for_time"]
          },
          failure: {
            text: "You get one year, charged against the startup funds at a rate the chair had worked out in advance. You have bought your own mornings and paid for them out of the only account you had.",
            stat_deltas: {},
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: []
          }
        }
      }
    ]
  },
  {
    id: "ne_quench_report",
    title: "Four kelvin warm",
    text: "The lower joint on the REBCO insert runs four kelvin warmer than the model says, on three ramps out of three. Nothing tripped, nothing is damaged, and your six weeks of critical current measurements on that test stand start on Monday.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.EARLY_CAREER],
    age_range: [29, 40],
    weight: 2,
    cooldown_years: 4,
    max_fires: 1,
    choices: [
      {
        label: "Take it to Kaur this week",
        outcomes: {
          success: {
            text: "They pull the insert for nine weeks and your campaign moves to the following year. The internal note names you in the second paragraph, and nobody outside the magnet group will ever read it.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {
              SCI: 1,
              NET: 2
            },
            relationship_deltas: {
              npc_kaur: RELD.COLLABORATED
            },
            flags_set: ["reported_early", "honest_operator"]
          }
        }
      },
      {
        label: "Spend two weeks instrumenting the joint first",
        stat_check: {
          stats: ["IN", "SM"],
          modifier: -0.05
        },
        outcomes: {
          success: {
            text: "Four extra voltage taps and a thermometer on the current lead, and you can show the joint resistance climbing with every thermal cycle. Kaur gets a mechanism instead of an anomaly, and you are third author on what the magnet group writes about it.",
            stat_deltas: {
              IN: 0.5,
              SM: 0.5
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 4,
              NET: 3
            },
            relationship_deltas: {
              npc_kaur: RELD.COLLABORATED
            },
            flags_set: ["diagnosed_it"]
          },
          failure: {
            text: "Two weeks of data saying the joint is warm, which is what you knew a fortnight earlier. You have spent a third of your campaign and told nobody, and you say both of those things at the Monday meeting in front of eleven people.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.MAJOR_SETBACK,
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
        label: "Run your six weeks first and write it up at the shutdown",
        stat_check: {
          stats: ["CO", "GR"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "Six weeks, no quench, and a complete critical current dataset at four field angles. The note goes in at the shutdown, the joint is remade as scheduled maintenance, and nobody asks what date you first plotted the ramps.",
            stat_deltas: {
              CO: 0.5,
              GR: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 3
            },
            relationship_deltas: {},
            flags_set: ["ran_it_first"]
          },
          failure: {
            text: "The insert quenches on ramp nineteen, in week four, with your run in progress. Nothing is damaged. The log holds three warm ramps in March and the date stamp on the plot you made of them.",
            stat_deltas: {},
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              SCI: -4,
              NET: -3
            },
            relationship_deltas: {
              npc_kaur: RELD.DISAGREED
            },
            flags_set: ["ran_it_first"]
          }
        }
      }
    ]
  },
  {
    id: "ne_undergrad_no_money",
    title: "An undergraduate with a folder",
    text: "She has read three of your papers and has questions about two of them. You have no money, no bench space and no time, and she is recognisably who you were at that age.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.EARLY_CAREER],
    age_range: [30, 40],
    weight: 2,
    cooldown_years: 3,
    max_fires: 2,
    choices: [
      {
        label: "Take her on unpaid, and say plainly that it is unfair",
        stat_check: {
          stats: ["CH", "GR"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "You tell her there is no money and that this is a bad deal, and she takes it anyway. Four days a week for eleven weeks, a poster at the autumn meeting with her name on it first, and a summer you spend paying her in attention.",
            stat_deltas: {
              CH: 0.3,
              SM: 0.3
            },
            stress_delta: STRESS.MENTORING,
            reputation_deltas: {
              NET: 2,
              SCI: 1
            },
            relationship_deltas: {},
            flags_set: ["unpaid_student"]
          },
          failure: {
            text: "In August the department asks who the unregistered person in the lab is, and the answer takes four emails and a meeting. You are told not to do it again. She is the one who loses the summer.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              NET: -2
            },
            relationship_deltas: {},
            flags_set: ["unpaid_student"]
          }
        }
      },
      {
        label: "Spend a favour and get her paid elsewhere",
        stat_check: {
          stats: ["CO", "CH"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "Two calls and one favour you had been saving. She spends the summer paid in Zhou's group instead of unpaid in yours, and thanks you for it. Zhou gets the paper.",
            stat_deltas: {
              CO: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              NET: 3
            },
            relationship_deltas: {
              npc_zhou: RELD.HELPED
            },
            flags_set: []
          },
          failure: {
            text: "Nobody has a line free that summer. She takes shifts in a cafe, does not apply to graduate school, and you hear about it three years later from somebody else.",
            stat_deltas: {},
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: []
          }
        }
      },
      {
        label: "Tell her to come back when you have funding",
        outcomes: {
          success: {
            text: "It is true and it takes a minute. You keep the summer you had already promised to the renewal, and the renewal goes in on time. She joins Nakamura and is second author on something good inside two years.",
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
      }
    ]
  },
  {
    id: "ne_reference_letter",
    title: "A letter you would rather not write",
    text: "A student who worked for you for two years wants a reference for a position that is a stretch. You can write the letter that gets it for her, or the letter that is accurate.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.EARLY_CAREER],
    age_range: [31, 40],
    weight: 2,
    cooldown_years: 3,
    max_fires: 2,
    choices: [
      {
        label: "Write it warm",
        stat_check: {
          stats: ["CH"],
          modifier: 0.1
        },
        outcomes: {
          success: {
            text: "She gets it. Eighteen months in she is doing the job, not comfortably, and doing it. You would not write that letter a second time.",
            stat_deltas: {
              CH: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              NET: 2
            },
            relationship_deltas: {},
            flags_set: ["wrote_it_warm"]
          },
          failure: {
            text: "She gets it and struggles in public for two years before leaving the field. The person who hired her rings you about the next candidate and listens to your adjectives differently.",
            stat_deltas: {},
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              NET: -3
            },
            relationship_deltas: {},
            flags_set: ["wrote_it_warm"]
          }
        }
      },
      {
        label: "Write it accurate",
        stat_check: {
          stats: ["CH", "GR"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "You set out what she is good at and where she is not there yet, both with examples, and the committee reads specific as strong. She gets the position. Two people on that panel start ringing you about other candidates.",
            stat_deltas: {
              GR: 0.3,
              CH: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: 2,
              NET: 3
            },
            relationship_deltas: {},
            flags_set: ["wrote_it_straight", "honest_operator"]
          },
          failure: {
            text: "Yours is the only letter in the file with a qualification in it, and the file has four. She does not get the position, and a year later she asks you what you said.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.RELATIONSHIP_CONFLICT,
            reputation_deltas: {
              SCI: 1
            },
            relationship_deltas: {},
            flags_set: ["wrote_it_straight", "honest_operator"]
          }
        }
      },
      {
        label: "Tell her you are not the right referee",
        outcomes: {
          success: {
            text: "A sentence with only one meaning, delivered gently. She finds a fourth referee, gets the position, and you spend the hour on your own resubmission. She never asks you for anything again.",
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
      }
    ]
  },
  {
    id: "ne_gift_authorship",
    title: "The name that was added",
    text: "The proof comes back from the journal with Lindqvist second on the author list. He did not run the experiment, write the code, or read the draft. The machine you used is his.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.EARLY_CAREER],
    age_range: [28, 36],
    weight: 2,
    cooldown_years: 4,
    max_fires: 1,
    choices: [
      {
        label: "Ask him to come off it",
        stat_check: {
          stats: ["CH", "GR"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "He is briefly and genuinely surprised, says of course, and has the correction filed by Thursday. You spend a fortnight waiting for a consequence that never arrives.",
            stat_deltas: {
              CH: 0.5,
              GR: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: 3
            },
            relationship_deltas: {
              npc_lindqvist: RELD.DISAGREED
            },
            flags_set: ["pushed_back"]
          },
          failure: {
            text: "He explains, at length and not unreasonably, what it costs to keep a machine running for people like you. The name stays, and so does the sense that you were told something true in order to end a conversation.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.RELATIONSHIP_CONFLICT,
            reputation_deltas: {},
            relationship_deltas: {
              npc_lindqvist: RELD.DISAGREED
            },
            flags_set: ["let_it_go"]
          }
        }
      },
      {
        label: "Leave it. It is one line.",
        outcomes: {
          success: {
            text: "It publishes as it stands. His name on your paper opens two doors that year, and every time you cite your own work you read the second author and feel the same small thing.",
            stat_deltas: {
              CO: 0.5
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {
              NET: 3
            },
            relationship_deltas: {
              npc_lindqvist: RELD.SHARED_CREDIT
            },
            flags_set: ["let_it_go"]
          }
        }
      }
    ]
  },
  {
    id: "ne_tbr_number",
    title: "The breeding ratio in the joint paper",
    text: "Reyes has the tritium breeding ratio at 1.15 in the draft you are both on. Your own reading of her neutronics puts it nearer 1.02, which is the difference between a plant that fuels itself and one that needs an external tritium supply nobody can currently sell it.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.EARLY_CAREER],
    age_range: [31, 40],
    weight: 2,
    cooldown_years: 4,
    max_fires: 1,
    choices: [
      {
        label: "Take it to her privately, with your numbers",
        stat_check: {
          stats: ["SM", "CH"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "She works through your calculation for an hour, finds the multiplier packing fraction she had carried over from an older model, and changes the number herself. It goes out at 1.04 with a paragraph on uncertainty neither of you would have written alone.",
            stat_deltas: {
              SM: 0.5,
              CH: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: 4
            },
            relationship_deltas: {
              npc_reyes: RELD.COLLABORATED
            },
            flags_set: ["checked_the_number"]
          },
          failure: {
            text: "She defends the figure firmly and you cannot close the argument in an afternoon. The paper goes out at 1.15 with your name on it, and your note on the assumption goes into a folder you never open.",
            stat_deltas: {
              IN: 0.3
            },
            stress_delta: STRESS.RELATIONSHIP_CONFLICT,
            reputation_deltas: {},
            relationship_deltas: {
              npc_reyes: RELD.DISAGREED
            },
            flags_set: ["let_a_number_stand"]
          }
        }
      },
      {
        label: "Ask for your name to come off",
        stat_check: {
          stats: ["CH", "GR"],
          modifier: -0.05
        },
        outcomes: {
          success: {
            text: "You withdraw in two polite sentences and give no reason anyone can quote. It publishes, it is cited widely, and three years later a benchmarking exercise finds the assumption and names the paper.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.RELATIONSHIP_CONFLICT,
            reputation_deltas: {
              SCI: 2,
              NET: -3
            },
            relationship_deltas: {
              npc_reyes: RELD.DISAGREED
            },
            flags_set: ["walked_from_a_paper", "honest_operator"]
          },
          failure: {
            text: "She asks you for the reason on the collaboration call, with nine people listening. You give it badly and the number stays. What is on the record now is the disagreement and the fact that you could not carry it.",
            stat_deltas: {},
            stress_delta: STRESS.RELATIONSHIP_CONFLICT,
            reputation_deltas: {
              SCI: -2,
              NET: -4
            },
            relationship_deltas: {
              npc_reyes: RELD.DISAGREED
            },
            flags_set: ["walked_from_a_paper"]
          }
        }
      },
      {
        label: "Sign it and move on",
        outcomes: {
          success: {
            text: "It is her section, her model, and her name first. The number appears in a funding document inside the year, and after that it is a number everybody uses.",
            stat_deltas: {},
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {
              SCI: 2,
              NET: 2
            },
            relationship_deltas: {
              npc_reyes: RELD.COLLABORATED
            },
            flags_set: ["let_a_number_stand"]
          }
        }
      }
    ]
  },
  {
    id: "ne_collaboration_offer",
    title: "Folded into something larger",
    text: "Nakamura is assembling a multi-machine study and wants your measurement in it. Your result becomes one panel of a fifteen-author paper everyone will read, or stays a paper of your own that a hundred people will.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.EARLY_CAREER],
    age_range: [29, 39],
    weight: 3,
    cooldown_years: 3,
    max_fires: 2,
    choices: [
      {
        label: "Join the study",
        stat_check: {
          stats: ["CH", "CO"],
          modifier: 0.1
        },
        outcomes: {
          success: {
            text: "Your panel is figure four. The paper is cited eight hundred times in five years and nobody outside the collaboration can tell which part was yours, which matters less than you expected it to.",
            stat_deltas: {
              CO: 0.5,
              CH: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: 4,
              NET: 5
            },
            relationship_deltas: {
              npc_nakamura: RELD.COLLABORATED
            },
            flags_set: ["joined_the_big_study"]
          },
          failure: {
            text: "The study takes three years to converge on a format everyone will sign. Your measurement is eighteen months stale by the time it appears, and it appears as a panel.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              NET: 2
            },
            relationship_deltas: {
              npc_nakamura: RELD.COLLABORATED
            },
            flags_set: []
          }
        }
      },
      {
        label: "Publish it yourself, first",
        outcomes: {
          success: {
            text: "Sole author, forty citations in five years, and your name unambiguously attached to the number. Nakamura cites you correctly in the study and does not ask you again.",
            stat_deltas: {
              SM: 0.3,
              GR: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: 2
            },
            relationship_deltas: {
              npc_nakamura: RELD.SOLE_CREDIT
            },
            flags_set: ["published_alone"]
          }
        }
      },
      {
        label: "Join, and ask to write the synthesis section",
        stat_check: {
          stats: ["CH", "SM"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "You draft the discussion for the whole study: four months of unpaid editing, and the fastest you have ever learned how fifteen groups think. Two of them ask to work with you directly the following year.",
            stat_deltas: {
              CH: 0.5,
              SM: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 3,
              NET: 6
            },
            relationship_deltas: {
              npc_nakamura: RELD.COLLABORATED
            },
            flags_set: ["wrote_the_synthesis"]
          },
          failure: {
            text: "The section goes to somebody more senior after two rounds of comments. You have done four months of editing and you are still figure four.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              NET: 2
            },
            relationship_deltas: {
              npc_nakamura: RELD.COMPETED_LOST
            },
            flags_set: []
          }
        }
      }
    ]
  },
  {
    id: "nm_hiring_the_difficult_one",
    title: "Two names on the shortlist",
    text: "The panel is deadlocked. Zhou is the best physicist who applied and left her last group with two people not speaking to her. Oyelaran is steady, publishes twice a year, and will never surprise anyone.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.MID_CAREER],
    age_range: [38, 52],
    weight: 3,
    cooldown_years: 4,
    max_fires: 2,
    choices: [
      {
        label: "Hire Zhou and manage the fallout",
        stat_check: {
          stats: ["CH", "IN"],
          modifier: -0.05
        },
        outcomes: {
          success: {
            text: "She produces the group's two best papers in four years, and you spend an afternoon a month keeping the peace. You decide it is a fair exchange without asking anyone else whether they agree.",
            stat_deltas: {
              IN: 0.5,
              CH: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 4
            },
            relationship_deltas: {
              npc_zhou: RELD.COLLABORATED
            },
            flags_set: ["hired_the_risk"]
          },
          failure: {
            text: "She is exactly as good as advertised and the group is not the same afterwards. A technician with eleven years on the machine transfers to another floor and gives you a reason that is not the reason.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              NET: -2
            },
            relationship_deltas: {
              npc_zhou: RELD.DISAGREED
            },
            flags_set: ["hired_the_risk", "group_frayed"]
          }
        }
      },
      {
        label: "Hire Oyelaran",
        outcomes: {
          success: {
            text: "He is precisely what the letters said, for eleven years, and never once costs you a Sunday. Twice you catch yourself reading Zhou's papers from somewhere else and closing the tab.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: 1
            },
            relationship_deltas: {
              npc_oyelaran: RELD.CHOSE_THEM
            },
            flags_set: ["hired_safe"]
          }
        }
      },
      {
        label: "Hold the line and re-advertise",
        stat_check: {
          stats: ["CO"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "You run a year short-handed and hire out of the second field a spectroscopist neither name on the first list would have beaten. The budget survives the wait, which is not the way that usually goes.",
            stat_deltas: {
              CO: 0.3,
              IN: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 2,
              NET: 1
            },
            relationship_deltas: {},
            flags_set: ["held_the_line", "hired_better"]
          },
          failure: {
            text: "The vacant line is swept into a central pool over the summer and does not come back. You explain to the group why there is no second postdoc, using the word restructuring.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              NET: -2
            },
            relationship_deltas: {},
            flags_set: ["lost_a_line"]
          }
        }
      }
    ]
  },
  {
    id: "nm_divertor_or_campaigns",
    title: "Tungsten or run time",
    text: "The upgrade budget covers one of two things: a tungsten divertor that lets the machine run hot for a decade, or two more campaigns on the graphite you already have. Castellanos wants an answer by Friday.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.MID_CAREER],
    age_range: [40, 55],
    weight: 2,
    cooldown_years: 5,
    max_fires: 1,
    choices: [
      {
        label: "Buy the divertor",
        stat_check: {
          stats: ["IN", "SM"],
          modifier: -0.05
        },
        outcomes: {
          success: {
            text: "Eighteen months of shutdown, then a target that takes ten megawatts per square metre without eroding carbon into the core. The machine runs regimes nothing with graphite in it can hold, and the people who complained about the dark year stop mentioning it around year three.",
            stat_deltas: {
              IN: 0.8,
              CO: 0.5
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 6
            },
            relationship_deltas: {
              npc_castellanos: RELD.COLLABORATED
            },
            flags_set: ["bought_divertor"]
          },
          failure: {
            text: "The install slips two quarters and the first campaign back finds tungsten accumulating in the core at levels nobody modelled. It becomes a decent paper on impurity transport, which is not the paper you were buying.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              SCI: 1
            },
            relationship_deltas: {
              npc_castellanos: RELD.DISAGREED
            },
            flags_set: ["divertor_trouble"]
          }
        }
      },
      {
        label: "Spend it on run time",
        outcomes: {
          success: {
            text: "Two campaigns, four papers, and a graphite divertor that will not survive the machine's next decade. Your successor will pay for this, and will be right to say so.",
            stat_deltas: {
              SM: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: 2
            },
            relationship_deltas: {
              npc_castellanos: RELD.DISAGREED
            },
            flags_set: ["bought_run_time"]
          }
        }
      }
    ]
  },
  {
    id: "nm_quiet_correction",
    title: "An error in a paper from 2049",
    text: "Kaur, rederiving your calibration for her own analysis, finds a factor you got wrong six years ago. The conclusion survives. The two numbers in the abstract do not.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.MID_CAREER],
    age_range: [40, 55],
    weight: 3,
    cooldown_years: 4,
    max_fires: 1,
    choices: [
      {
        label: "File the erratum",
        stat_check: {
          stats: ["SM", "GR"],
          modifier: 0.1
        },
        outcomes: {
          success: {
            text: "Four paragraphs in the journal and an email to the eleven groups who used the calibration. Nothing bad happens, except that the paper carries a correction beside it forever.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {
              SCI: 2
            },
            relationship_deltas: {
              npc_kaur: RELD.HELPED
            },
            flags_set: ["filed_erratum", "honest_operator"]
          },
          failure: {
            text: "The erratum posts three weeks before your renewal goes to panel. A reviewer asks, politely and in writing, which other calibrations from that period are still in circulation, and you spend six weeks answering.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              SCI: 1,
              NET: -2
            },
            relationship_deltas: {
              npc_kaur: RELD.HELPED
            },
            flags_set: ["filed_erratum", "honest_operator"]
          }
        }
      },
      {
        label: "Fix it quietly in the next paper",
        stat_check: {
          stats: ["SM"],
          modifier: 0.1
        },
        outcomes: {
          success: {
            text: "The corrected value appears in the follow-up with no footnote, six weeks earlier than an erratum would have let you submit, and the follow-up is read as new work rather than a repair. Two people notice the change, and one of them is Kaur, who now knows what you do with an inconvenient number.",
            stat_deltas: {
              SM: 0.5,
              IN: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {
              SCI: 3
            },
            relationship_deltas: {
              npc_kaur: RELD.IGNORED
            },
            flags_set: ["quiet_fix"]
          },
          failure: {
            text: "Nakamura's group spends a year chasing the discrepancy and writes to ask about it. The correction becomes public anyway, with somebody else's year attached to it.",
            stat_deltas: {},
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              SCI: -4
            },
            relationship_deltas: {
              npc_nakamura: RELD.DISAGREED
            },
            flags_set: ["caught_quiet_fix"]
          }
        }
      },
      {
        label: "Let Kaur write it, first author",
        stat_check: {
          stats: ["CH"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "She writes it carefully and learns what the field looks like when it works. Your name is second on a correction to your own paper, which is a sentence you did not expect to be fine with.",
            stat_deltas: {
              CH: 0.5
            },
            stress_delta: STRESS.MENTORING,
            reputation_deltas: {
              SCI: 2,
              NET: 1
            },
            relationship_deltas: {
              npc_kaur: RELD.SHARED_CREDIT
            },
            flags_set: ["filed_erratum", "real_mentor"]
          },
          failure: {
            text: "She writes it so apologetically that a referee reads the error as worse than it is. You take it back and file it yourself, and something between you cools by a degree.",
            stat_deltas: {},
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              SCI: 1
            },
            relationship_deltas: {
              npc_kaur: RELD.SOLE_CREDIT
            },
            flags_set: ["filed_erratum"]
          }
        }
      }
    ]
  },
  {
    id: "nm_clip_that_travelled",
    title: "The clip",
    text: "Forty seconds of your seminar, cut so that a record shot sounds like a power plant. It has three million views, the budget markup is in six weeks, and Abara has emailed asking whether you want to comment.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.MID_CAREER],
    age_range: [40, 55],
    weight: 2,
    cooldown_years: 5,
    max_fires: 1,
    choices: [
      {
        label: "Correct the record in public",
        stat_check: {
          stats: ["CH", "SM"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "Eight hundred careful words on what Q is and what it is not. It gets a tenth of the traffic of the clip and is still being cited by the people who matter three years later.",
            stat_deltas: {
              CH: 0.5,
              SM: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: 3,
              PUB: 2
            },
            relationship_deltas: {
              npc_abara: RELD.SPOKE_WELL
            },
            flags_set: ["corrected_the_record", "honest_operator"]
          },
          failure: {
            text: "The correction reads as a walk-back and the clip keeps travelling without it. Two weeks later a committee staffer asks whether the field oversells, and you cannot honestly say no.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              PUB: -3
            },
            relationship_deltas: {},
            flags_set: ["correction_backfired"]
          }
        }
      },
      {
        label: "Say nothing until the markup is done",
        outcomes: {
          success: {
            text: "The number stays wrong and the line item survives, and you are not confident those two facts are unrelated. Nobody asks you to correct it, which is the part that stays with you.",
            stat_deltas: {
              CO: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {
              PUB: 3,
              SCI: -2
            },
            relationship_deltas: {
              npc_abara: RELD.IGNORED
            },
            flags_set: ["let_it_ride"]
          }
        }
      }
    ]
  },
  {
    id: "nm_two_lines_one_budget",
    title: "One of the two lines",
    text: "The continuing resolution takes eleven percent, and eleven percent is one postdoc. Both have been with you four years, both are good, and neither has been told anything yet.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.MID_CAREER],
    age_range: [38, 54],
    weight: 3,
    cooldown_years: 4,
    max_fires: 2,
    choices: [
      {
        label: "Make the cut and tell them yourself, today",
        stat_check: {
          stats: ["CH", "GR"],
          modifier: 0.1
        },
        outcomes: {
          success: {
            text: "You do it in person, badly, and then spend three weeks on the phone finding them somewhere better. They land well, and they still take four days to answer your emails.",
            stat_deltas: {
              GR: 0.3,
              CH: 0.3
            },
            stress_delta: STRESS.RELATIONSHIP_CONFLICT,
            reputation_deltas: {
              NET: 1
            },
            relationship_deltas: {},
            flags_set: ["made_the_cut"]
          },
          failure: {
            text: "The revised staffing table goes round on the Tuesday morning, before you have found either of them in the building. One hears it from a technician on another floor and comes to your office to check whether it is true.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              NET: -3
            },
            relationship_deltas: {},
            flags_set: ["made_the_cut", "told_badly"]
          }
        }
      },
      {
        label: "Cover the gap from the equipment budget",
        stat_check: {
          stats: ["CO", "SM"],
          modifier: -0.05
        },
        outcomes: {
          success: {
            text: "You find it in deferred maintenance and a diagnostic upgrade nobody will miss for a year. Both keep their jobs; the turbomolecular pump you did not replace fails in the spring and takes four weeks of run time with it.",
            stat_deltas: {
              CO: 0.5
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              NET: 2,
              SCI: -1
            },
            relationship_deltas: {},
            flags_set: ["robbed_the_hardware"]
          },
          failure: {
            text: "Finance finds the transfer in a routine reconciliation and unwinds it in March. You make the cut anyway, three months later, with the trust already spent.",
            stat_deltas: {},
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              NET: -3
            },
            relationship_deltas: {},
            flags_set: ["made_the_cut", "caught_shuffling"]
          }
        }
      },
      {
        label: "Teach two extra courses and cover it",
        stat_check: {
          stats: ["GR"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "Six contact hours a week you had stopped budgeting for, and both lines survive the year. The paper you were writing goes in a drawer and does not come out for two years.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              NET: 2,
              SCI: -2
            },
            relationship_deltas: {},
            flags_set: ["covered_the_gap"]
          },
          failure: {
            text: "The buy-out arithmetic fails at the second attempt because your own salary sat on the same grant. You make the cut in February with the extra teaching still on the timetable.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["made_the_cut"]
          }
        }
      }
    ]
  },
  {
    id: "nm_poached_postdoc",
    title: "Kaur has an offer",
    text: "A compact-tokamak company has offered her double, options, and a machine that will exist within three years. She tells you before she tells anyone, which is either loyalty or a request.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.MID_CAREER],
    age_range: [38, 53],
    weight: 3,
    cooldown_years: 3,
    max_fires: 2,
    choices: [
      {
        label: "Fight for a staff line",
        stat_check: {
          stats: ["CO", "CH"],
          modifier: -0.05
        },
        outcomes: {
          success: {
            text: "The department finds a staff-scientist position in six weeks, which is the fastest anyone has seen them move. She stays at two thirds of the offer, runs the next four campaigns, and now knows exactly what she is worth.",
            stat_deltas: {
              CO: 0.5,
              IN: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 3,
              NET: 1
            },
            relationship_deltas: {
              npc_kaur: RELD.HELPED
            },
            flags_set: ["kept_kaur"]
          },
          failure: {
            text: "The line never appears. You spent capital promising her something you could not deliver, and she leaves in March having heard you promise it.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              NET: -2
            },
            relationship_deltas: {
              npc_kaur: RELD.DISAGREED
            },
            flags_set: ["lost_kaur"]
          }
        }
      },
      {
        label: "Tell her to take it, and write the reference",
        outcomes: {
          success: {
            text: "You write the best letter you have written for anyone leaving. Four years on she runs their diagnostics group, and twice sends you data you could not have taken yourself. The third time, their legal review stops her.",
            stat_deltas: {
              CH: 0.3
            },
            stress_delta: STRESS.RELATIONSHIP_POSITIVE,
            reputation_deltas: {
              NET: 2,
              SCI: -2
            },
            relationship_deltas: {
              npc_kaur: RELD.HELPED
            },
            flags_set: ["lost_kaur", "real_mentor"]
          }
        }
      },
      {
        label: "Ask her to finish the campaign first",
        stat_check: {
          stats: ["CH"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "She defers her start by five months and the campaign lands. You get the paper, she gets a smaller equity grant, and neither of you says the second half of that out loud.",
            stat_deltas: {
              IN: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: 2
            },
            relationship_deltas: {
              npc_kaur: RELD.COLLABORATED
            },
            flags_set: ["finished_campaign", "lost_kaur"]
          },
          failure: {
            text: "She says yes and means it, and the company will not move the date. She goes in six weeks, and the campaign runs a diagnostic short for the rest of the year.",
            stat_deltas: {},
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              SCI: -1
            },
            relationship_deltas: {
              npc_kaur: RELD.DISAGREED
            },
            flags_set: ["lost_kaur"]
          }
        }
      }
    ]
  },
  {
    id: "nm_disruption_margin",
    title: "The current you have not run",
    text: "The physics case wants two megaamps. The disruption mitigation system is validated to one point six, on a smaller machine, in simulation. A disruption at full current is a repair bill rather than a data point.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.MID_CAREER],
    age_range: [38, 55],
    weight: 2,
    cooldown_years: 4,
    max_fires: 2,
    choices: [
      {
        label: "Run it at full current",
        stat_check: {
          stats: ["IN", "SM"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "You get four shots at two megaamps before the machine has had enough, and the four shots settle a question the field has argued about for fifteen years.",
            stat_deltas: {
              IN: 0.8
            },
            stress_delta: STRESS.MAJOR_SUCCESS,
            reputation_deltas: {
              SCI: 6
            },
            relationship_deltas: {
              npc_petrov: RELD.COLLABORATED
            },
            flags_set: ["ran_the_margin"]
          },
          failure: {
            text: "The third shot goes vertically unstable and disrupts before the gas gets there. Nothing is destroyed, the halo currents put a load through a vessel support that it was never designed to see, and the metrology afterwards eats the rest of the campaign.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              SCI: -3
            },
            relationship_deltas: {
              npc_petrov: RELD.DISAGREED
            },
            flags_set: ["disrupted_hard"]
          }
        }
      },
      {
        label: "Stop at one point six and publish the trend",
        outcomes: {
          success: {
            text: "A clean scaling, an honest extrapolation, and a final figure that stops where the data stops. A group with a bigger machine and less to lose takes the last point two years later.",
            stat_deltas: {
              SM: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {
              SCI: 2
            },
            relationship_deltas: {},
            flags_set: ["stopped_short"]
          }
        }
      }
    ]
  },
  {
    id: "nm_the_difficult_colleague",
    title: "What Reyes is like to work for",
    text: "Two students have left his group in three years and both exit interviews said the same thing in very careful language. He is also the reason the pellet injector works, and since April he reports to you.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.MID_CAREER],
    age_range: [40, 55],
    weight: 2,
    cooldown_years: 5,
    max_fires: 1,
    choices: [
      {
        label: "Start the formal process",
        stat_check: {
          stats: ["GR", "CH"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "Eleven months, three meetings with human resources, and a written plan he actually follows. The injector keeps working and two students finish who would not have.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              NET: 3
            },
            relationship_deltas: {
              npc_reyes: RELD.DISAGREED
            },
            flags_set: ["ran_the_process"]
          },
          failure: {
            text: "The process stalls on the evidence, which is all in the shape of careful language. He knows now, and the building has learned that a complaint buys eleven months of nothing.",
            stat_deltas: {},
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              NET: -3
            },
            relationship_deltas: {
              npc_reyes: RELD.COMPETED_LOST
            },
            flags_set: ["process_failed"]
          }
        }
      },
      {
        label: "Have the conversation, no paperwork",
        stat_check: {
          stats: ["CH"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "Ninety minutes with the door shut. He is angry, then quiet, then different, and the next two students stay. Nothing is on record, including the improvement.",
            stat_deltas: {
              CH: 0.5
            },
            stress_delta: STRESS.RELATIONSHIP_CONFLICT,
            reputation_deltas: {
              NET: 1
            },
            relationship_deltas: {
              npc_reyes: RELD.DISAGREED
            },
            flags_set: ["quiet_word"]
          },
          failure: {
            text: "He hears it as an attack from a manager who has not built anything in a decade. The behaviour goes underground, and the next student to leave does so without an interview.",
            stat_deltas: {},
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              NET: -2
            },
            relationship_deltas: {
              npc_reyes: RELD.COMPETED_LOST
            },
            flags_set: ["lost_the_room"]
          }
        }
      },
      {
        label: "Move the students, leave him the hardware",
        outcomes: {
          success: {
            text: "You reassign both doctoral projects and let him keep the injector and no people. It works, in the sense that nobody else gets hurt, and he spends the next decade building injectors and training nobody.",
            stat_deltas: {
              CO: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {
              npc_reyes: RELD.IGNORED
            },
            flags_set: ["worked_around_it"]
          }
        }
      }
    ]
  },
  {
    id: "nm_referee_conflict",
    title: "The manuscript in your inbox",
    text: "The editor has sent you Iwasaki's paper to review. It is careful, it is correct, and it is four months ahead of the analysis sitting half finished on your own machine.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.MID_CAREER],
    age_range: [38, 55],
    weight: 3,
    cooldown_years: 3,
    max_fires: 2,
    choices: [
      {
        label: "Recuse yourself and say why",
        outcomes: {
          success: {
            text: "You decline in two sentences that name the overlap. The editor thanks you and finds someone slower. Your own analysis is still four months behind, and by the time you submit, the framing everybody uses is Iwasaki's.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {
              SCI: 1
            },
            relationship_deltas: {
              npc_iwasaki: RELD.SPOKE_WELL
            },
            flags_set: ["recused", "honest_operator"]
          }
        }
      },
      {
        label: "Review it properly, finish yours after",
        stat_check: {
          stats: ["SM", "GR"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "You write a review that makes the paper better and cite it as prior work three months later. Iwasaki works out who the referee was and says so, once, at a conference bar.",
            stat_deltas: {
              SM: 0.5
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 3
            },
            relationship_deltas: {
              npc_iwasaki: RELD.COLLABORATED
            },
            flags_set: ["reviewed_straight"]
          },
          failure: {
            text: "The review is fair and takes seven weeks you did not have. By the time you get back to your own analysis, the interesting half of it belongs to somebody else.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["scooped_by_review"]
          }
        }
      },
      {
        label: "Ask for two weeks, post yours first",
        stat_check: {
          stats: ["GR", "IN"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "The preprint goes up on the Thursday and the review goes back on the Friday, positive and detailed. Yours is the one the follow-up papers build on, everything you did was permitted, and you would not describe it out loud.",
            stat_deltas: {
              IN: 0.5
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 4
            },
            relationship_deltas: {
              npc_iwasaki: RELD.COMPETED_WON
            },
            flags_set: ["posted_first"]
          },
          failure: {
            text: "The timestamps are public and Iwasaki reads them. Nothing is ever said formally, and that journal does not send you a manuscript again.",
            stat_deltas: {},
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              SCI: -2,
              NET: -3
            },
            relationship_deltas: {
              npc_iwasaki: RELD.DISAGREED
            },
            flags_set: ["burned_a_referee"]
          }
        }
      }
    ]
  },
  {
    id: "nm_tbr_signature",
    title: "The number in the design report",
    text: "The blanket chapter quotes a tritium breeding ratio of one point zero five. It is defensible with the neutronics as run, and the neutronics assume a first wall with no ports in it. Your signature goes on the cover.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.MID_CAREER],
    age_range: [42, 55],
    weight: 2,
    cooldown_years: 5,
    max_fires: 1,
    choices: [
      {
        label: "Sign it with a written caveat",
        stat_check: {
          stats: ["SM", "CH"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "Two paragraphs on port penetrations and margin, annexed to the chapter. The number stays and the annex stays with it, and a review panel later calls the annex the most useful page in the document.",
            stat_deltas: {
              SM: 0.5,
              CH: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: 4
            },
            relationship_deltas: {
              npc_hartley: RELD.COLLABORATED
            },
            flags_set: ["signed_with_caveat", "honest_operator"]
          },
          failure: {
            text: "The annex is compressed to one sentence in the executive summary, which is the version everybody actually reads. Your name is on the cover of both versions.",
            stat_deltas: {},
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              SCI: -1
            },
            relationship_deltas: {},
            flags_set: ["caveat_lost"]
          }
        }
      },
      {
        label: "Refuse to sign until it is re-run with ports",
        stat_check: {
          stats: ["GR", "CO"],
          modifier: -0.05
        },
        outcomes: {
          success: {
            text: "Four months of extra neutronics and a ratio that comes back at zero point nine eight with the heating ports in. The programme office is not grateful, the design is not viable as drawn, and both of those things were already true.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 3,
              NET: -3
            },
            relationship_deltas: {
              npc_hartley: RELD.DISAGREED
            },
            flags_set: ["held_the_number"]
          },
          failure: {
            text: "A deputy director signs the cover in eleven days. The neutronics are never re-run, the chapter goes out with the number intact, and you are off the design team by the next quarterly.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              SCI: 1,
              NET: -4
            },
            relationship_deltas: {
              npc_hartley: RELD.COMPETED_LOST
            },
            flags_set: ["held_the_number", "off_the_design_team"]
          }
        }
      },
      {
        label: "Sign it. It is a concept study.",
        outcomes: {
          success: {
            text: "You sign, because concept studies are not construction drawings and everyone in the room knows it. The number is in a press release within a fortnight, without the word concept anywhere near it.",
            stat_deltas: {
              CO: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {
              PUB: 2,
              SCI: -2
            },
            relationship_deltas: {
              npc_hartley: RELD.COLLABORATED
            },
            flags_set: ["signed_clean"]
          }
        }
      }
    ]
  },
  {
    id: "nm_program_manager_rotation",
    title: "The other side of the desk",
    text: "The agency wants you for a two-year detail as a programme manager: no bench, no students, and a hand on which forty groups get funded. Hartley says whoever takes it shapes the next decade more than any of them will.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.MID_CAREER],
    age_range: [42, 55],
    weight: 1,
    cooldown_years: 5,
    max_fires: 1,
    choices: [
      {
        label: "Take the detail",
        stat_check: {
          stats: ["CH", "CO"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "Two years of other people's proposals, and a portfolio you tilt toward the unglamorous work the field actually needs. You come back with no papers and a phone that people answer.",
            stat_deltas: {
              CO: 0.8,
              CH: 0.5
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              NET: 7,
              SCI: -3
            },
            relationship_deltas: {
              npc_hartley: RELD.COLLABORATED
            },
            flags_set: ["did_the_rotation"]
          },
          failure: {
            text: "You spend two years learning that a programme manager mostly defends a budget line from people senior to them. The portfolio looks the same when you leave, and your group has scattered.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              NET: 3,
              SCI: -5
            },
            relationship_deltas: {
              npc_hartley: RELD.IGNORED
            },
            flags_set: ["did_the_rotation", "group_scattered"]
          }
        }
      },
      {
        label: "Stay with the machine",
        outcomes: {
          success: {
            text: "You decline politely and keep your Tuesdays. Someone with less patience for the unglamorous work takes it, and you spend the next decade writing letters to them.",
            stat_deltas: {
              IN: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: 2,
              NET: -2
            },
            relationship_deltas: {
              npc_hartley: RELD.DISAGREED
            },
            flags_set: ["declined_rotation"]
          }
        }
      }
    ]
  },
  {
    id: "nm_okafor_last_paper",
    title: "Okafor sends a draft",
    text: "Your old advisor, emeritus three years now, sends a manuscript with your name already on it. The idea is hers and it is still good. The error analysis is from a version of her that was sharper.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.MID_CAREER],
    age_range: [44, 55],
    weight: 2,
    cooldown_years: 5,
    max_fires: 1,
    choices: [
      {
        label: "Rebuild the analysis, keep both names",
        stat_check: {
          stats: ["SM", "CH"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "A fortnight on the uncertainties, sent back with every change marked. She reads all of them, agrees with eleven of twelve, and argues you to a standstill on the last one.",
            stat_deltas: {
              SM: 0.5,
              CH: 0.3
            },
            stress_delta: STRESS.MENTORING,
            reputation_deltas: {
              SCI: 3
            },
            relationship_deltas: {
              npc_okafor: RELD.COLLABORATED
            },
            flags_set: ["fixed_her_paper"]
          },
          failure: {
            text: "She reads the rewrite as being handled. The paper goes out with your corrections in it and a coolness that lasts two years, in which she publishes nothing at all.",
            stat_deltas: {},
            stress_delta: STRESS.RELATIONSHIP_CONFLICT,
            reputation_deltas: {
              SCI: 1
            },
            relationship_deltas: {
              npc_okafor: RELD.DISAGREED
            },
            flags_set: ["fixed_her_paper"]
          }
        }
      },
      {
        label: "Ask for your name to come off",
        stat_check: {
          stats: ["CH"],
          modifier: -0.05
        },
        outcomes: {
          success: {
            text: "You put it as a disagreement about the error budget and she takes it as one. She pulls the paper back for four months, reworks the uncertainties herself, and submits it alone, where it holds.",
            stat_deltas: {
              GR: 0.3,
              SM: 0.3
            },
            stress_delta: STRESS.RELATIONSHIP_CONFLICT,
            reputation_deltas: {},
            relationship_deltas: {
              npc_okafor: RELD.SPOKE_WELL
            },
            flags_set: ["name_off"]
          },
          failure: {
            text: "You tell her the analysis is not something you can sign, which is true and lands as something else entirely. She submits alone, unchanged, and a referee finds the same problem in nine days.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.RELATIONSHIP_CONFLICT,
            reputation_deltas: {},
            relationship_deltas: {
              npc_okafor: RELD.DISAGREED
            },
            flags_set: ["name_off"]
          }
        }
      },
      {
        label: "Sign it as it stands",
        outcomes: {
          success: {
            text: "It is a small paper in a small journal that perhaps forty people will read. Two of the forty write to ask about the error bars, and you answer both of them yourself.",
            stat_deltas: {},
            stress_delta: STRESS.REST,
            reputation_deltas: {
              SCI: -2
            },
            relationship_deltas: {
              npc_okafor: RELD.HELPED
            },
            flags_set: ["signed_for_her"]
          }
        }
      }
    ]
  },
  {
    id: "nm_shutdown_summer",
    title: "The shutdown lands in July",
    text: "The vessel opens in July and closes in September, and the only person qualified to supervise the in-vessel work is you. It is also the eight weeks you have promised, twice, to be somewhere else.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.MID_CAREER],
    age_range: [38, 54],
    weight: 3,
    cooldown_years: 4,
    max_fires: 2,
    choices: [
      {
        label: "Run the shutdown yourself",
        outcomes: {
          success: {
            text: "You are in the hall for all of it and the machine comes back on schedule for the first time in four years. Nobody at home mentions the summer, then or since.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 2
            },
            relationship_deltas: {},
            flags_set: ["ran_the_shutdown"]
          }
        }
      },
      {
        label: "Hand it to Castellanos and go",
        stat_check: {
          stats: ["CH", "CO"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "He runs it better than you would have, which you learn from four time zones away in a weekly call you find yourself looking forward to.",
            stat_deltas: {
              CH: 0.3,
              CO: 0.3
            },
            stress_delta: STRESS.REST,
            reputation_deltas: {
              NET: 2
            },
            relationship_deltas: {
              npc_castellanos: RELD.HELPED
            },
            flags_set: ["delegated_shutdown"]
          },
          failure: {
            text: "A flange is torqued wrong and the leak takes three weeks to find in October. Your name is on the work package, and you were unreachable for six of the eight weeks.",
            stat_deltas: {},
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              SCI: -3
            },
            relationship_deltas: {
              npc_castellanos: RELD.COLLABORATED
            },
            flags_set: ["shutdown_slipped"]
          }
        }
      },
      {
        label: "Split it: four weeks in, four weeks out",
        stat_check: {
          stats: ["GR"],
          modifier: -0.05
        },
        outcomes: {
          success: {
            text: "You do the opening and the closing and hand Castellanos the middle, where the tile survey is, and he does not need you for any of it. It is the least bad arrangement available and nobody involved calls it good.",
            stat_deltas: {
              GR: 0.3,
              CH: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 1,
              NET: 1
            },
            relationship_deltas: {
              npc_castellanos: RELD.HELPED
            },
            flags_set: ["split_the_summer", "partial_delegate"]
          },
          failure: {
            text: "The difficult work slides into the fortnight you were away. You come back to a schedule two weeks behind, and make a phone call from an airport that you did not want to make.",
            stat_deltas: {},
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["split_the_summer"]
          }
        }
      }
    ]
  },
  {
    id: "nm_varga_offer",
    title: "Varga calls from the chip company",
    text: "Three of your cohort left the field this year. R\u00e9ka Varga, who ran the Thursday problem sets, now runs plasma etch for a semiconductor firm and wants you on the physics side. The number she says out loud is your salary and a half.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.MID_CAREER],
    age_range: [40, 53],
    weight: 2,
    cooldown_years: 5,
    max_fires: 1,
    choices: [
      {
        label: "Say no over a long dinner",
        outcomes: {
          success: {
            text: "You give the honest reason, which is that you would like to see the machine work before you stop. She pays, says the offer stands for a year, and it does.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.RELATIONSHIP_POSITIVE,
            reputation_deltas: {},
            relationship_deltas: {
              npc_varga: RELD.SPOKE_WELL
            },
            flags_set: ["stayed_in_field"]
          }
        }
      },
      {
        label: "Take the consulting arrangement instead",
        stat_check: {
          stats: ["CO", "SM"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "Six days a quarter, a rate you had to practise saying, and a genuinely interesting problem in sheath uniformity across a three hundred millimetre wafer. Your group gets a smaller share of you and does not notice for a year.",
            stat_deltas: {
              CO: 0.5
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              NET: 2,
              SCI: -1
            },
            relationship_deltas: {
              npc_varga: RELD.COLLABORATED
            },
            flags_set: ["takes_consulting"]
          },
          failure: {
            text: "Six days become eleven, then fourteen, and the quarter you miss a proposal deadline is the quarter you stop calling it six days. You end it a year in, poorer and clearer.",
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
            flags_set: ["ended_consulting"]
          }
        }
      }
    ]
  },
  {
    id: "ns_emeritus_office",
    title: "The smaller office",
    text: "The department offers emeritus status: a title, a mailbox, and a room on the third floor with one window. Keeping your current lab space means someone younger waits another three years for it.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.SENIOR],
    age_range: [58, 68],
    weight: 3,
    cooldown_years: 3,
    max_fires: 1,
    choices: [
      {
        label: "Take the emeritus office",
        outcomes: {
          success: {
            text: "You move forty years of reprints into eleven boxes and throw away nine of them. The window faces the cooling towers, which is more than the old office had.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.REST,
            reputation_deltas: {
              NET: -2
            },
            relationship_deltas: {},
            flags_set: ["took_emeritus"]
          }
        }
      },
      {
        label: "Keep the space one more cycle",
        stat_check: {
          stats: ["CO"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "You argue that the campaign needs continuity and you are not wrong. The postdoc who was waiting gets a bench in the annex and is gracious about it in a way you notice.",
            stat_deltas: {
              CO: 0.5
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 2
            },
            relationship_deltas: {},
            flags_set: ["held_the_lab"]
          },
          failure: {
            text: "The chair listens, agrees with every word, and gives the space to the incoming group leader anyway. You are told this in a corridor, which is how such things are usually told.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {
              NET: -2
            },
            relationship_deltas: {},
            flags_set: ["lost_the_lab"]
          }
        }
      }
    ]
  },
  {
    id: "ns_student_overtakes",
    title: "Agarwal gets there first",
    text: "Her group publishes the transport result you have been circling since your forties, cleaner than you would have managed, with your old paper as reference eleven. A journal asks you to write the accompanying commentary.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.SENIOR],
    age_range: [56, 66],
    weight: 3,
    cooldown_years: 4,
    max_fires: 1,
    choices: [
      {
        label: "Write the commentary, and mean it",
        outcomes: {
          success: {
            text: "You spend a weekend on eight hundred words placing her result properly in thirty years of the field. It is a commentary, and commentaries are read once, and everyone who reads this one already knew what you thought.",
            stat_deltas: {
              CH: 0.3
            },
            stress_delta: STRESS.RELATIONSHIP_POSITIVE,
            reputation_deltas: {
              NET: 3
            },
            relationship_deltas: {
              npc_agarwal: RELD.SPOKE_WELL
            },
            flags_set: ["blessed_successor"]
          }
        }
      },
      {
        label: "Write it with the caveat you still believe",
        stat_check: {
          stats: ["SM", "CH"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "You praise the measurement and flag the one assumption you think will not survive. She emails within the hour to say you are right and that she had been worrying about it too. The assumption fails in print eighteen months later, in her paper, crediting the commentary.",
            stat_deltas: {
              SM: 0.5
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: 5
            },
            relationship_deltas: {
              npc_agarwal: RELD.COLLABORATED
            },
            flags_set: ["honest_operator"]
          },
          failure: {
            text: "The caveat is the only part anyone quotes. In print it reads like a man defending ground he no longer holds, and you can see why.",
            stat_deltas: {},
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              SCI: -2,
              NET: -3
            },
            relationship_deltas: {
              npc_agarwal: RELD.DISAGREED
            },
            flags_set: ["seen_as_obstacle"]
          }
        }
      },
      {
        label: "Decline, and send her your old run logs",
        stat_check: {
          stats: ["IN", "GR"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "Four boxes from a machine that no longer exists, including the eleven shots that never made a paper. She finds a systematic in them neither of you had seen and puts you second author on the follow-up.",
            stat_deltas: {
              IN: 0.5
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: 4,
              NET: 2
            },
            relationship_deltas: {
              npc_agarwal: RELD.COLLABORATED
            },
            flags_set: ["gave_the_notebooks"]
          },
          failure: {
            text: "The boxes arrive and sit in her office for a year. The handwriting is yours and the calibration conventions are nobody's, and there is no longer anyone alive who can decode column four.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {
              npc_agarwal: RELD.HELPED
            },
            flags_set: []
          }
        }
      }
    ]
  },
  {
    id: "ns_last_shot_list",
    title: "The last shot list",
    text: "Final campaign before the shutdown, and the run coordinator has one day left to allocate. Your pedestal measurement has waited eleven years. Iwasaki's postdoc needs it for a divertor scan that is half a thesis.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.SENIOR],
    age_range: [57, 66],
    weight: 3,
    cooldown_years: 3,
    max_fires: 1,
    choices: [
      {
        label: "Take the day",
        stat_check: {
          stats: ["IN", "GR"],
          modifier: -0.05
        },
        outcomes: {
          success: {
            text: "Eleven years, thirty-one shots, and a number with an error bar you can live with. You write it up alone, which you have not done since you were thirty.",
            stat_deltas: {
              IN: 0.8,
              GR: 0.3
            },
            stress_delta: STRESS.MAJOR_SUCCESS,
            reputation_deltas: {
              SCI: 5
            },
            relationship_deltas: {
              npc_iwasaki: RELD.DISAGREED
            },
            flags_set: ["took_the_last_slot"]
          },
          failure: {
            text: "A vertical displacement event on the fourth shot takes the reciprocating probe head with it. The rest of the day goes to conditioning shots and an incident form. The measurement stays exactly where it has been for eleven years, and it is somebody else's problem now.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {
              npc_iwasaki: RELD.DISAGREED
            },
            flags_set: ["measurement_unfinished"]
          }
        }
      },
      {
        label: "Give it to the postdoc",
        outcomes: {
          success: {
            text: "The divertor scan runs clean and the thesis defends in the spring. Your measurement goes into the review article as an open question, phrased carefully enough that someone will take it up.",
            stat_deltas: {
              CH: 0.5
            },
            stress_delta: STRESS.MENTORING,
            reputation_deltas: {
              NET: 3
            },
            relationship_deltas: {
              npc_iwasaki: RELD.HELPED
            },
            flags_set: ["gave_the_last_slot"]
          }
        }
      }
    ]
  },
  {
    id: "ns_ninety_seconds",
    title: "Ninety seconds on tritium",
    text: "An appropriations subcommittee wants to know why the programme needs a breeding blanket at all. You have ninety seconds and a member who has already used the phrase unlimited free energy twice.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.SENIOR],
    age_range: [54, 68],
    weight: 3,
    cooldown_years: 4,
    max_fires: 2,
    choices: [
      {
        label: "Explain the breeding ratio properly",
        stat_check: {
          stats: ["SM", "CH"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "You get lithium, the blanket, and the sentence about there being some twenty kilogrammes of tritium on earth and one plant burning fifty a year, into eighty seconds. One staffer takes notes. The line item survives at ninety percent.",
            stat_deltas: {
              CH: 0.5,
              SM: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              PUB: 4,
              SCI: 2
            },
            relationship_deltas: {},
            flags_set: ["explained_the_hard_part"]
          },
          failure: {
            text: "You lose them in the second sentence and get asked twice when it will be on the grid. The transcript reads as though you did not answer, because you did not.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              PUB: -3
            },
            relationship_deltas: {},
            flags_set: ["lost_the_room"]
          }
        }
      },
      {
        label: "Give them the analogy and skip the arithmetic",
        stat_check: {
          stats: ["CH"],
          modifier: 0.1
        },
        outcomes: {
          success: {
            text: "The analogy lands, the room nods, and the number goes through. Two years later a different committee is surprised to learn there is a tritium problem at all.",
            stat_deltas: {
              CH: 0.5
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              PUB: 5,
              SCI: -2
            },
            relationship_deltas: {},
            flags_set: ["simplified_it"]
          },
          failure: {
            text: "The analogy invites a follow-up you cannot answer inside the analogy. Unpicking it in public costs you the rest of the session and most of the goodwill.",
            stat_deltas: {},
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
        label: "Send your deputy in your place",
        outcomes: {
          success: {
            text: "She is better at rooms like that than you ever were and worse at the physics, and the transcript shows both. You watch the stream from your office and send no notes afterwards.",
            stat_deltas: {},
            stress_delta: STRESS.REST,
            reputation_deltas: {
              NET: 1
            },
            relationship_deltas: {},
            flags_set: ["stepped_back_from_policy"]
          }
        }
      }
    ]
  },
  {
    id: "ns_logbooks",
    title: "Forty years of logbooks",
    text: "The hall is being cleared and nobody wants the paper. Two hundred bound volumes, every campaign since you arrived, most of it never digitised and some of it never published.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.SENIOR],
    age_range: [58, 69],
    weight: 2,
    cooldown_years: 3,
    max_fires: 1,
    choices: [
      {
        label: "Scan them yourself, page by page",
        stat_check: {
          stats: ["GR"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "Six months, a flatbed scanner, and a naming convention you invent on the second afternoon. Three groups cite the archive within two years, mostly for the shots that failed.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 4,
              NET: 2
            },
            relationship_deltas: {},
            flags_set: ["built_the_archive"]
          },
          failure: {
            text: "You get through sixty volumes before your wrist and your patience give out. The partial archive is genuinely useful and stops mid-decade for a reason nobody will ever be able to reconstruct.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {
              SCI: 2
            },
            relationship_deltas: {},
            flags_set: ["partial_archive"]
          }
        }
      },
      {
        label: "Fund a student to do it properly",
        stat_check: {
          stats: ["CO"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "Eight months of a master's student's time and a metadata schema better than anything you would have invented. She gets a paper out of the recalibration alone.",
            stat_deltas: {
              CO: 0.5
            },
            stress_delta: STRESS.MENTORING,
            reputation_deltas: {
              SCI: 3,
              NET: 3
            },
            relationship_deltas: {},
            flags_set: ["funded_the_archive"]
          },
          failure: {
            text: "The money does not come. She does four months of it unpaid because she wants to, and stops when the term does, and you are not comfortable with any part of that.",
            stat_deltas: {},
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {
              SCI: 1
            },
            relationship_deltas: {},
            flags_set: []
          }
        }
      },
      {
        label: "Keep one box, recycle the rest",
        outcomes: {
          success: {
            text: "You take the campaign that mattered and the one that nearly ended the programme. The skip sits on the loading dock for a day and a half, and you do not walk past it twice.",
            stat_deltas: {},
            stress_delta: STRESS.REST,
            reputation_deltas: {
              SCI: -2
            },
            relationship_deltas: {},
            flags_set: ["let_the_records_go"]
          }
        }
      }
    ]
  },
  {
    id: "ns_decommission_vote",
    title: "The vote on your own machine",
    text: "You sit on the panel deciding which facilities the programme keeps. Your machine is thirty years old, still producing, and costs what two smaller experiments would.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.SENIOR],
    age_range: [56, 67],
    weight: 2,
    cooldown_years: 5,
    max_fires: 1,
    choices: [
      {
        label: "Make the case for closing it yourself",
        outcomes: {
          success: {
            text: "You put the argument on the record so that nobody else has to. The money goes to two university machines that will outlive you. Nineteen people in the control room hear about it from a press release, and six of them have worked for you for twenty years.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              SCI: 3,
              NET: -2
            },
            relationship_deltas: {},
            flags_set: ["closed_own_machine"]
          }
        }
      },
      {
        label: "Argue for it, then leave the room",
        stat_check: {
          stats: ["CH", "CO"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "You state the conflict, argue the physics once, and recuse yourself from the vote. It survives by one, the run programme keeps its people for another six years, and nobody can say the process was bent.",
            stat_deltas: {
              CH: 0.5,
              CO: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: 3,
              NET: 4
            },
            relationship_deltas: {},
            flags_set: ["saved_the_machine"]
          },
          failure: {
            text: "It closes anyway, four to three, and the minutes show you speaking for your own facility. Both halves of that sentence follow you around for a couple of years.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              NET: -3
            },
            relationship_deltas: {},
            flags_set: ["lost_the_machine"]
          }
        }
      }
    ]
  },
  {
    id: "ns_hall_named",
    title: "They want to put your name on it",
    text: "The lab proposes naming the diagnostic hall after you. It is normally done posthumously. The director calls it a kindness, and it is also, transparently, a fundraising asset.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.SENIOR],
    age_range: [60, 70],
    weight: 1,
    cooldown_years: 5,
    max_fires: 1,
    choices: [
      {
        label: "Accept it",
        outcomes: {
          success: {
            text: "A plaque, a small reception, and thirty people who worked in that hall for a decade watching a building get named for their work. You say exactly that in the speech, and the plaque reads the way it was always going to read.",
            stat_deltas: {
              CH: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              PUB: 4,
              NET: 1
            },
            relationship_deltas: {},
            flags_set: ["named_after_you"]
          }
        }
      },
      {
        label: "Ask them to name it for Haddad",
        stat_check: {
          stats: ["CH", "CO"],
          modifier: -0.05
        },
        outcomes: {
          success: {
            text: "He built nine of the eleven instruments in that hall and has never had his name on anything but a maintenance log. The director agrees inside a week. Haddad tells you off for it, at length, delighted, and the technical staff hear how the decision was made before the press release goes out.",
            stat_deltas: {
              CH: 0.5
            },
            stress_delta: STRESS.RELATIONSHIP_POSITIVE,
            reputation_deltas: {
              NET: 6,
              SCI: 2
            },
            relationship_deltas: {
              npc_haddad: RELD.SHARED_CREDIT
            },
            flags_set: ["deflected_the_honour"]
          },
          failure: {
            text: "The proposal has a donor attached and the donor gave for your name. You are told this kindly and it is not negotiable. Haddad hears the whole story secondhand, from someone in the room, before you get to him.",
            stat_deltas: {},
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {
              PUB: 3,
              NET: -2
            },
            relationship_deltas: {
              npc_haddad: RELD.SOLE_CREDIT
            },
            flags_set: ["named_after_you"]
          }
        }
      }
    ]
  },
  {
    id: "ns_referee_the_capstone",
    title: "Dubois sends his last paper",
    text: "Forty years of his approach, gathered into one review plainly meant to be the last thing he publishes. The editor asks you to referee it. Section four rests on a calibration that was superseded a decade ago.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.SENIOR],
    age_range: [58, 69],
    weight: 2,
    cooldown_years: 4,
    max_fires: 1,
    choices: [
      {
        label: "Write the report that says so",
        stat_check: {
          stats: ["SM", "GR"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "Three pages, technical, no adjectives. He rewrites section four in six weeks and the review is better for it, and he works out who the referee was inside a day and never mentions it.",
            stat_deltas: {
              SM: 0.5
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: 5
            },
            relationship_deltas: {
              npc_dubois: RELD.DISAGREED
            },
            flags_set: ["refereed_straight"]
          },
          failure: {
            text: "He withdraws it rather than rewrite. The review never appears, and forty years of an approach that deserved a summary does not get one.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              SCI: 2
            },
            relationship_deltas: {
              npc_dubois: RELD.COMPETED_WON
            },
            flags_set: []
          }
        }
      },
      {
        label: "Call him before you write anything",
        stat_check: {
          stats: ["CH", "CO"],
          modifier: -0.05
        },
        outcomes: {
          success: {
            text: "You break every convention of blind review with one phone call. He is furious for ninety seconds and grateful for the next hour, and the corrected version is the best thing either of you has written.",
            stat_deltas: {
              CH: 0.5,
              IN: 0.3
            },
            stress_delta: STRESS.RELATIONSHIP_POSITIVE,
            reputation_deltas: {
              SCI: 4,
              NET: 3
            },
            relationship_deltas: {
              npc_dubois: RELD.COLLABORATED
            },
            flags_set: ["broke_blind_review"]
          },
          failure: {
            text: "He reports the call to the editor, correctly. You come off the referee pool for that journal, the paper publishes uncorrected, and you were right about the calibration the whole time.",
            stat_deltas: {},
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              SCI: -3,
              NET: -4
            },
            relationship_deltas: {
              npc_dubois: RELD.COMPETED_LOST
            },
            flags_set: ["broke_blind_review"]
          }
        }
      },
      {
        label: "Recommend acceptance and let it stand",
        outcomes: {
          success: {
            text: "It publishes with section four intact. A graduate student finds the error two years later and is polite about it in a footnote. Dubois works out who refereed it, and six months on his calibration archive arrives unasked, forty years of raw scans, and you use it twice.",
            stat_deltas: {
              IN: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {
              SCI: -3,
              NET: 2
            },
            relationship_deltas: {
              npc_dubois: RELD.HELPED
            },
            flags_set: ["let_it_pass"]
          }
        }
      }
    ]
  },
  {
    id: "ns_the_textbook",
    title: "The book nobody else will write",
    text: "A publisher wants the graduate text on confinement the field has needed for twenty years. Three years of work, no papers in them, and a royalty that would not cover the coffee.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.SENIOR],
    age_range: [55, 66],
    weight: 2,
    cooldown_years: 4,
    max_fires: 1,
    choices: [
      {
        label: "Write it",
        stat_check: {
          stats: ["SM", "GR"],
          modifier: -0.05
        },
        outcomes: {
          success: {
            text: "Nine hundred pages and four years, not three. It lands on most of the graduate reading lists you can check, and the errata file runs to three pages before the second printing.",
            stat_deltas: {
              SM: 0.8,
              GR: 0.5
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 6,
              PUB: 3
            },
            relationship_deltas: {},
            flags_set: ["wrote_the_textbook"]
          },
          failure: {
            text: "You reach chapter eleven and the field moves under you. The manuscript stays at sixty percent on a drive for the rest of your life, and two chapters circulate as lecture notes and are quietly excellent.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              SCI: 1
            },
            relationship_deltas: {},
            flags_set: ["unfinished_textbook"]
          }
        }
      },
      {
        label: "Write it with three co-authors",
        stat_check: {
          stats: ["CH", "CO"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "Four names, two years, and a divertor chapter better than anything you could have written alone. The arguments about notation take longer than the physics.",
            stat_deltas: {
              CH: 0.5,
              CO: 0.3
            },
            stress_delta: STRESS.MENTORING,
            reputation_deltas: {
              SCI: 4,
              NET: 4
            },
            relationship_deltas: {
              npc_iwasaki: RELD.COLLABORATED
            },
            flags_set: ["wrote_the_textbook"]
          },
          failure: {
            text: "Two of the three deliver late and one not at all. You write their chapters and leave their names on, which is correct, and it takes a year to stop resenting.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 3
            },
            relationship_deltas: {
              npc_iwasaki: RELD.SHARED_CREDIT
            },
            flags_set: ["wrote_the_textbook"]
          }
        }
      },
      {
        label: "Keep publishing instead",
        outcomes: {
          success: {
            text: "Six more papers in the years the book would have taken. Two of them matter. Somebody else writes the textbook eight years later, and it is fine, and you use it.",
            stat_deltas: {
              SM: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: 3
            },
            relationship_deltas: {},
            flags_set: ["kept_publishing"]
          }
        }
      }
    ]
  },
  {
    id: "ns_final_student",
    title: "A first year, at your age",
    text: "She has read everything you have written and wants you to supervise. The doctorate runs five years. You have not committed to five years of anything since the last renewal.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.SENIOR],
    age_range: [58, 68],
    weight: 3,
    cooldown_years: 3,
    max_fires: 1,
    choices: [
      {
        label: "Take her on, and name a co-supervisor now",
        stat_check: {
          stats: ["CO", "CH"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "You tell her the arithmetic on the first afternoon and put Fischer on the paperwork the same week. She has two advisors for four years and one for the last, and defends without a gap in the record.",
            stat_deltas: {
              CH: 0.5
            },
            stress_delta: STRESS.MENTORING,
            reputation_deltas: {
              NET: 4
            },
            relationship_deltas: {
              npc_fischer: RELD.COLLABORATED
            },
            flags_set: ["planned_the_handover"]
          },
          failure: {
            text: "Fischer signs the form and reads nothing for three years. When you step back in year four she spends a semester teaching her second supervisor her own project, and submits a term late.",
            stat_deltas: {},
            stress_delta: STRESS.RELATIONSHIP_CONFLICT,
            reputation_deltas: {
              NET: -1
            },
            relationship_deltas: {
              npc_fischer: RELD.IGNORED
            },
            flags_set: ["handover_on_paper"]
          }
        }
      },
      {
        label: "Take her on yourself",
        stat_check: {
          stats: ["GR", "CH"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "You make it to the defence, thinner and slower, and sit at the back while other people ask the questions. It is the last thing you do in that department, and you get through the whole viva without once answering for her.",
            stat_deltas: {
              GR: 0.5,
              CH: 0.3
            },
            stress_delta: STRESS.MENTORING,
            reputation_deltas: {
              NET: 3,
              SCI: 3
            },
            relationship_deltas: {},
            flags_set: ["saw_her_through"]
          },
          failure: {
            text: "You step back in her third year for reasons that are nobody's fault. The handover costs her a semester she does not get back. She finishes, and she is careful with you afterwards.",
            stat_deltas: {},
            stress_delta: STRESS.RELATIONSHIP_CONFLICT,
            reputation_deltas: {
              NET: -2
            },
            relationship_deltas: {},
            flags_set: ["handover_went_badly"]
          }
        }
      },
      {
        label: "Send her to someone with a decade left",
        outcomes: {
          success: {
            text: "You write the introduction to Agarwal yourself and make it a strong one. She gets a better doctorate than you could have given her, and you read the thesis when it appears, twice.",
            stat_deltas: {},
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {
              NET: 2
            },
            relationship_deltas: {
              npc_agarwal: RELD.HELPED
            },
            flags_set: ["sent_her_on"]
          }
        }
      }
    ]
  },
  {
    id: "ns_stop_date",
    title: "Choosing a last day",
    text: "Nobody is going to ask you to leave. That is the problem: the decision is entirely yours, and every year you do not make it is a year you have made by default.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.SENIOR],
    age_range: [60, 70],
    weight: 3,
    cooldown_years: 4,
    max_fires: 1,
    choices: [
      {
        label: "Set the date and tell people",
        outcomes: {
          success: {
            text: "Eighteen months out, in writing, to the chair and to the group. The transition is orderly and the farewell is warm, and the fortnight after it is the longest fortnight of your life.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.LIFE_EVENT,
            reputation_deltas: {
              NET: 2
            },
            relationship_deltas: {},
            flags_set: ["set_a_stop_date"]
          }
        }
      },
      {
        label: "Keep going while the work is good",
        stat_check: {
          stats: ["GR", "IN"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "Four more years, two of them productive, one of them the best in a decade. You stop when the answer to the honest question changes, and not before.",
            stat_deltas: {
              IN: 0.5,
              GR: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 4
            },
            relationship_deltas: {},
            flags_set: ["worked_on"]
          },
          failure: {
            text: "You stay past the point where the group works around you rather than with you. Nobody says anything for two years, which is its own kind of answer.",
            stat_deltas: {},
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              SCI: -2,
              NET: -3
            },
            relationship_deltas: {},
            flags_set: ["stayed_too_long"]
          }
        }
      },
      {
        label: "Ask the group what they think",
        stat_check: {
          stats: ["CH"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "You ask properly and they tell you: two more years on the analysis, then go. The number is more specific than you expected, and nobody looks at the floor while saying it. You get the two years and the group plans around them.",
            stat_deltas: {
              CH: 0.5
            },
            stress_delta: STRESS.RELATIONSHIP_POSITIVE,
            reputation_deltas: {
              NET: 5,
              SCI: 2
            },
            relationship_deltas: {},
            flags_set: ["asked_the_group"]
          },
          failure: {
            text: "They tell you what they think you want to hear, warmly and unanimously, and you have been in enough rooms to know exactly what that sounds like. You set the date blind, in the end, and a year later than you should have.",
            stat_deltas: {},
            stress_delta: STRESS.RELATIONSHIP_CONFLICT,
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
    id: "ns_memorial_notice",
    title: "The notice for Okafor",
    text: "She died on a Tuesday, at eighty-nine, and the society wants nine hundred words by Friday. You are the obvious person to write them, and you have not spoken to her since the last conference she attended.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.SENIOR],
    age_range: [60, 70],
    weight: 2,
    cooldown_years: 5,
    max_fires: 1,
    choices: [
      {
        label: "Write the honest one",
        stat_check: {
          stats: ["CH", "IN"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "You put in the red ink, the two students she lost to industry and never forgave herself for, and the paper she was wrong about for a decade. Three of her former students write to say it was the only notice that sounded like her.",
            stat_deltas: {
              CH: 0.5,
              IN: 0.3
            },
            stress_delta: STRESS.LIFE_EVENT,
            reputation_deltas: {
              SCI: 3,
              NET: 3
            },
            relationship_deltas: {},
            flags_set: ["wrote_the_memorial"]
          },
          failure: {
            text: "The society cuts the difficult paragraph before it runs. Your full draft circulates anyway, and you spend a fortnight explaining to two of her old collaborators that you were not settling anything.",
            stat_deltas: {},
            stress_delta: STRESS.LIFE_EVENT,
            reputation_deltas: {
              NET: -2
            },
            relationship_deltas: {},
            flags_set: ["wrote_the_memorial"]
          }
        }
      },
      {
        label: "Write the standard one",
        outcomes: {
          success: {
            text: "Dates, positions, the list of honours, the phrase about being greatly missed. It takes ninety minutes and it is correct in every particular. You keep the other draft.",
            stat_deltas: {},
            stress_delta: STRESS.LIFE_EVENT,
            reputation_deltas: {
              NET: 1
            },
            relationship_deltas: {},
            flags_set: ["wrote_the_memorial"]
          }
        }
      }
    ]
  },
  {
    id: "ns_code_nobody_runs",
    title: "The code only you can run",
    text: "Thirty years of Fortran, a build that works on exactly one machine in the building, and the transport solver that three of your best results depend on. Nobody has read it but you.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.SENIOR],
    age_range: [55, 68],
    weight: 2,
    cooldown_years: 4,
    max_fires: 1,
    choices: [
      {
        label: "Spend a year making it public",
        stat_check: {
          stats: ["SM", "GR"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "Documentation, a test suite, a licence, and eleven bugs found on the way, one of which changes a figure in a paper of yours from the forties. You publish the correction alongside the release.",
            stat_deltas: {
              SM: 0.5,
              GR: 0.5
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 5,
              NET: 3
            },
            relationship_deltas: {},
            flags_set: ["released_the_code", "honest_operator"]
          },
          failure: {
            text: "The rewrite stalls on a dependency nobody can build any more. You publish the source as it stands with a README saying, accurately, that it worked in 2049.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {
              SCI: 2
            },
            relationship_deltas: {},
            flags_set: ["released_the_code"]
          }
        }
      },
      {
        label: "Teach it to one person",
        stat_check: {
          stats: ["CH", "SM"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "Fischer sits with you two mornings a week for a term and comes out able to run it and unwilling to touch it. He maintains it for fifteen years and calls it, affectionately, the hairball.",
            stat_deltas: {
              CH: 0.5
            },
            stress_delta: STRESS.MENTORING,
            reputation_deltas: {
              SCI: 3,
              NET: 2
            },
            relationship_deltas: {
              npc_fischer: RELD.HELPED
            },
            flags_set: ["passed_the_code_on"]
          },
          failure: {
            text: "He learns it well enough to reproduce the cases you already ran and no further. When the compiler changes the whole thing stops, and three results stand on nothing anyone can check.",
            stat_deltas: {},
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              SCI: -2
            },
            relationship_deltas: {
              npc_fischer: RELD.IGNORED
            },
            flags_set: []
          }
        }
      },
      {
        label: "Leave it on the drive",
        outcomes: {
          success: {
            text: "It runs until the machine it runs on is retired. The results stay in the literature, uncontested and unverifiable, which is a category the field has more of than it admits.",
            stat_deltas: {},
            stress_delta: STRESS.REST,
            reputation_deltas: {
              SCI: -3
            },
            relationship_deltas: {},
            flags_set: ["code_lost"]
          }
        }
      }
    ]
  },
  {
    id: "ns_roadmap_endorsement",
    title: "They want your name on the roadmap",
    text: "The new group leader has a ten-year plan built around a concept you have thought was a dead end for fifteen years. She wants your endorsement in the front matter, and she will probably get the funding either way.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.SENIOR],
    age_range: [54, 67],
    weight: 3,
    cooldown_years: 4,
    max_fires: 2,
    choices: [
      {
        label: "Endorse it and stay out of the way",
        outcomes: {
          success: {
            text: "Your name goes on page two and the roadmap funds. You turn out to be right about the concept, and being right about it from page two is worth nothing at all.",
            stat_deltas: {},
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {
              NET: 3,
              SCI: -2
            },
            relationship_deltas: {},
            flags_set: ["endorsed_the_roadmap"]
          }
        }
      },
      {
        label: "Refuse, and put the reasons in writing",
        stat_check: {
          stats: ["SM", "GR"],
          modifier: -0.05
        },
        outcomes: {
          success: {
            text: "Four pages of technical objection, circulated openly. The plan changes in two of the five places you flagged, funds anyway, and does better than it would have.",
            stat_deltas: {
              SM: 0.5,
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              SCI: 5,
              NET: -3
            },
            relationship_deltas: {},
            flags_set: ["refused_the_roadmap"]
          },
          failure: {
            text: "It reads to everyone under fifty as the old guard defending its own approach. The plan funds unchanged, and you are not on the list for the review.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              NET: -5
            },
            relationship_deltas: {},
            flags_set: ["refused_the_roadmap", "seen_as_obstacle"]
          }
        }
      },
      {
        label: "Endorse it, and ask for one milestone in year three",
        stat_check: {
          stats: ["CH", "CO"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "A single go or no-go criterion, written into the plan at your insistence. In year three it fails cleanly and the group pivots with seven years of funding left.",
            stat_deltas: {
              CH: 0.5,
              IN: 0.5
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: 4,
              NET: 4
            },
            relationship_deltas: {},
            flags_set: ["wrote_the_milestone"]
          },
          failure: {
            text: "The milestone survives into the draft and out of the final version. Nobody removed it on purpose. That is roughly how it always goes.",
            stat_deltas: {},
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {
              NET: 1
            },
            relationship_deltas: {},
            flags_set: ["endorsed_the_roadmap"]
          }
        }
      }
    ]
  },
  {
    id: "nx_desk_rejection",
    title: "Back in four days",
    text: "Two years of work returned without review. The editor's note is three sentences long and the third one is that it is unlikely to interest the general readership.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.EARLY_CAREER, STAGE.MID_CAREER],
    age_range: [29, 52],
    weight: 3,
    cooldown_years: 3,
    max_fires: 3,
    choices: [
      {
        label: "Send it to the specialist journal",
        stat_check: {
          stats: ["SM", "GR"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "In press within five months, read by the two hundred people who needed it and cited by most of them. A third of the impact factor and none of the wait.",
            stat_deltas: {
              SM: 0.3,
              GR: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: 3
            },
            relationship_deltas: {},
            flags_set: ["published_specialist"]
          },
          failure: {
            text: "The specialist referees want the machine-to-machine comparison you cut to make length. Two more months of work, and it appears eleven months after the desk rejection, next to a paper that scooped one of your figures.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              SCI: 1
            },
            relationship_deltas: {},
            flags_set: ["published_specialist"]
          }
        }
      },
      {
        label: "Appeal the desk decision",
        stat_check: {
          stats: ["CH", "SM"],
          modifier: -0.05
        },
        outcomes: {
          success: {
            text: "The appeal works, which almost never happens. It goes out for review, comes back with two reports you learn from, and publishes eleven months after you first sent it, where people outside the field will see it.",
            stat_deltas: {
              CH: 0.5
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: 3,
              PUB: 2
            },
            relationship_deltas: {},
            flags_set: ["appealed_and_won"]
          },
          failure: {
            text: "Declined in one line by someone who did not sign it. You have spent six weeks arguing about a cover letter, and the paper is exactly where it was.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["appeal_declined"]
          }
        }
      },
      {
        label: "Put it in the drawer for now",
        outcomes: {
          success: {
            text: "You spend the eighteen months on the next measurement instead, and it goes better for the attention. Another group publishes the same argument, shorter and less careful. Yours was first, in a folder, which counts for nothing anywhere.",
            stat_deltas: {
              IN: 0.3
            },
            stress_delta: STRESS.REST,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["drawered_a_paper"]
          }
        }
      }
    ]
  },
  {
    id: "nx_quiet_result",
    title: "The result nobody notices",
    text: "You settle a twenty-year disagreement about edge transport, and the paper collects nine citations in four years, six of them yours. The programme committee gives you the last slot before lunch.",
    type: EVENT_TYPE.RANDOM,
    stage: [STAGE.EARLY_CAREER, STAGE.MID_CAREER, STAGE.SENIOR],
    age_range: [30, 62],
    weight: 2,
    cooldown_years: 4,
    max_fires: 2,
    choices: [
      {
        label: "Spend two years saying it in more rooms",
        stat_check: {
          stats: ["CH", "CO"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "Seminars, a review article, one very patient press officer. By the end of it the result is the thing everyone assumed all along, and two groups have built their next proposal on top of it.",
            stat_deltas: {
              CH: 0.5,
              CO: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 4,
              NET: 3
            },
            relationship_deltas: {},
            flags_set: ["pushed_the_result"]
          },
          failure: {
            text: "Two years of selling a result, and you start to sound like someone selling a result. The physics does not change. The way rooms listen to you does.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {
              PUB: 2,
              SCI: -1
            },
            relationship_deltas: {},
            flags_set: ["sounded_like_a_salesman"]
          }
        }
      },
      {
        label: "Let the work stand",
        outcomes: {
          success: {
            text: "It gets found slowly, by the people who needed it. A review calls it foundational eleven years later, in one sentence, and the citation count never moves much.",
            stat_deltas: {
              IN: 0.3
            },
            stress_delta: STRESS.REST,
            reputation_deltas: {
              SCI: 2
            },
            relationship_deltas: {},
            flags_set: ["let_it_stand"]
          }
        }
      }
    ]
  },
  {
    id: "nx_collaborator_silence",
    title: "Reyes stops answering",
    text: "Four months into a joint analysis the emails get shorter and then stop. The shared document has not been touched since March, and half of the cross-calibration lives on her disk.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.EARLY_CAREER, STAGE.MID_CAREER],
    age_range: [30, 52],
    weight: 3,
    cooldown_years: 4,
    max_fires: 2,
    choices: [
      {
        label: "Call her about something other than the paper",
        stat_check: {
          stats: ["CH"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "Her mother is dying and she has told nobody at work. You take the calibration over, badly at first, and the paper comes out a year late with both names on it.",
            stat_deltas: {
              CH: 0.5
            },
            stress_delta: STRESS.RELATIONSHIP_POSITIVE,
            reputation_deltas: {
              SCI: 1,
              NET: 2
            },
            relationship_deltas: {
              npc_reyes: RELD.HELPED
            },
            flags_set: ["stayed_with_reyes"]
          },
          failure: {
            text: "She is polite for eleven minutes and says nothing at all. You finish the analysis alone and put her name on it because the instrument is hers, and you do not hear from her for three years.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.RELATIONSHIP_CONFLICT,
            reputation_deltas: {
              SCI: 1
            },
            relationship_deltas: {
              npc_reyes: RELD.SHARED_CREDIT
            },
            flags_set: []
          }
        }
      },
      {
        label: "Rebuild her half yourself",
        stat_check: {
          stats: ["SM", "GR"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "Six weeks reconstructing four months of somebody else's work from her logbook and your memory. It is done correctly, it is done alone, and it is done in time for the October deadline.",
            stat_deltas: {
              SM: 0.5,
              GR: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 3
            },
            relationship_deltas: {
              npc_reyes: RELD.SOLE_CREDIT
            },
            flags_set: ["rebuilt_alone"]
          },
          failure: {
            text: "You get the cross-calibration subtly wrong and a referee finds it in one paragraph. Two more months, and the version of record now has a comment attached.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              SCI: -2
            },
            relationship_deltas: {
              npc_reyes: RELD.SOLE_CREDIT
            },
            flags_set: []
          }
        }
      },
      {
        label: "Wait. She will come back.",
        outcomes: {
          success: {
            text: "She does, eleven months later, with an apology and an explanation you did not need. You spent the eleven months on the beam emission data and got further than you expected. The joint result is still good, and the window in which anyone cared has closed.",
            stat_deltas: {
              IN: 0.3
            },
            stress_delta: STRESS.REST,
            reputation_deltas: {},
            relationship_deltas: {
              npc_reyes: RELD.COLLABORATED
            },
            flags_set: ["waited_it_out"]
          }
        }
      }
    ]
  },
  {
    id: "nx_cryostat_deadline",
    title: "Cryostat, Thursday, 2am",
    text: "A thermal short in one of the cold mass supports warms the coil nine kelvin overnight. It quenches at ten past two, the repair needs a three-week shutdown, and the milestone report is due to the programme office in nine days.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.EARLY_CAREER, STAGE.MID_CAREER],
    age_range: [30, 52],
    weight: 3,
    cooldown_years: 4,
    max_fires: 2,
    choices: [
      {
        label: "Report the slip and give the real date",
        outcomes: {
          success: {
            text: "The programme manager takes it well, which is worse than a fight, because it means she had already assumed it. The next review lists schedule confidence as a concern anyway.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {
              SCI: 1,
              NET: -1
            },
            relationship_deltas: {},
            flags_set: ["reported_the_slip", "honest_operator"]
          }
        }
      },
      {
        label: "Run degraded and report the milestone met",
        stat_check: {
          stats: ["IN", "SM"],
          modifier: -0.1
        },
        outcomes: {
          success: {
            text: "You take the measurement at two thirds of design field, with a footnote about the operating point that is honest and very easy to skip. Milestone met, in the sense that milestones are ever met, and the next tranche releases on schedule.",
            stat_deltas: {
              IN: 0.5
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 2,
              NET: 2
            },
            relationship_deltas: {},
            flags_set: ["ran_degraded"]
          },
          failure: {
            text: "The degraded data will not carry the claim. It unravels in February, and you spend a whole review defending a footnote you wrote at four in the morning.",
            stat_deltas: {},
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              SCI: -3
            },
            relationship_deltas: {},
            flags_set: ["defended_a_footnote"]
          }
        }
      },
      {
        label: "Compress the shutdown to eleven days",
        stat_check: {
          stats: ["GR", "CO"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "Two weekends, a favour from the cryogenics group, and a purchase order that clears in four days instead of six weeks. You are back on the machine with a day spare and sleep for sixteen hours.",
            stat_deltas: {
              GR: 0.5,
              CO: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              NET: 3,
              SCI: 1
            },
            relationship_deltas: {},
            flags_set: ["beat_the_shutdown"]
          },
          failure: {
            text: "Rushing the cool-down leaves moisture in the helium circuit and it freezes in the heat exchanger. Three weeks becomes five, the campaign moves to the autumn, and everybody is extremely kind about it.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              SCI: -2
            },
            relationship_deltas: {},
            flags_set: ["blocked_the_heat_exchanger"]
          }
        }
      }
    ]
  },
  {
    id: "nx_school_talk",
    title: "Year nines, third period",
    text: "A school forty minutes away wants an hour on fusion. It is the same afternoon as the collaboration telecon where next cycle's run plan gets decided.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.EARLY_CAREER, STAGE.MID_CAREER, STAGE.SENIOR],
    age_range: [30, 62],
    weight: 3,
    cooldown_years: 3,
    max_fires: 3,
    choices: [
      {
        label: "Go, and do it properly",
        stat_check: {
          stats: ["CH"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "You bring a magnet and a plasma ball and let them ask anything. One of them asks where the tritium comes from, and you get all the way to breeding blankets and why the ratio has to clear one. A local paper picks it up. The run plan is decided without you and arrives by email.",
            stat_deltas: {
              CH: 0.5
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              PUB: 4
            },
            relationship_deltas: {},
            flags_set: ["did_outreach"]
          },
          failure: {
            text: "You pitch it above their heads and below their interest, and lose the room by minute twenty. A teacher rescues the last ten minutes. On the drive back you know exactly which three slides did it.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {
              PUB: 1
            },
            relationship_deltas: {},
            flags_set: ["did_outreach"]
          }
        }
      },
      {
        label: "Send the postdoc, take the telecon",
        outcomes: {
          success: {
            text: "She does it competently and comes back with two questions from year nines that neither of you can answer. You get the shifts you wanted out of ninety minutes that decided almost nothing else.",
            stat_deltas: {
              CO: 0.3
            },
            stress_delta: STRESS.REST,
            reputation_deltas: {
              NET: 1
            },
            relationship_deltas: {},
            flags_set: ["delegated_outreach"]
          }
        }
      }
    ]
  },
  {
    id: "nx_shoulder_ache",
    title: "The thing in your shoulder",
    text: "It has been there since the spring. It is worse on the nights you sleep in the office chair, which is most of them, so you have a theory that costs nothing to keep.",
    type: EVENT_TYPE.RANDOM,
    stage: [STAGE.MID_CAREER, STAGE.SENIOR],
    age_range: [42, 63],
    weight: 2,
    cooldown_years: 4,
    max_fires: 2,
    choices: [
      {
        label: "Book the appointment",
        outcomes: {
          success: {
            text: "Three weeks of physiotherapy, all of it mid-afternoon, and a short lecture about chairs. It goes. You hand four of your own shifts to someone else to make the appointments and read about the campaign afterwards.",
            stat_deltas: {},
            stress_delta: STRESS.REST,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["saw_the_doctor"]
          }
        }
      },
      {
        label: "Wait until after the campaign",
        stat_check: {
          stats: ["GR"],
          modifier: 0.1
        },
        outcomes: {
          success: {
            text: "The campaign ends in November with you on every shift you signed up for, including the two nights that produced the only clean data of the run. The shoulder is no worse, so you book nothing, and it stays at that level for another decade.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 2
            },
            relationship_deltas: {},
            flags_set: ["ignored_it"]
          },
          failure: {
            text: "By December you cannot get your arm to the top of the whiteboard. The physiotherapist asks how long it has been, you say a few months, and she writes down what you said in a way you can see.",
            stat_deltas: {},
            stress_delta: STRESS.LIFE_EVENT,
            reputation_deltas: {},
            relationship_deltas: {},
            flags_set: ["ignored_it", "shoulder_gave_out"]
          }
        }
      }
    ]
  },
  {
    id: "nx_referee_conflict",
    title: "The manuscript in your inbox",
    text: "An editor sends you a paper from the group you are racing, on the measurement you are eight weeks from finishing. Reviewing it means reading it first and saying nothing about it for six weeks.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.EARLY_CAREER, STAGE.MID_CAREER],
    age_range: [30, 55],
    weight: 2,
    cooldown_years: 4,
    max_fires: 2,
    choices: [
      {
        label: "Decline and state the conflict",
        outcomes: {
          success: {
            text: "Two lines to the editor, and you delete the attachment unopened. It publishes in March ahead of yours, and you never find out whether you would have been fair.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {
              SCI: 1
            },
            relationship_deltas: {},
            flags_set: ["declined_conflicted_review", "honest_operator"]
          }
        }
      },
      {
        label: "Review it in ten days and review it straight",
        stat_check: {
          stats: ["GR", "SM"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "You recommend acceptance with two corrections that make it stronger, and the editor tells them who caught it because you asked to be unblinded. They cite your preprint when it appears three weeks behind theirs, and the two groups start talking.",
            stat_deltas: {
              SM: 0.5,
              GR: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: 3,
              NET: 3
            },
            relationship_deltas: {},
            flags_set: ["reviewed_the_rival", "honest_operator"]
          },
          failure: {
            text: "You write it fairly and you write it thin, because you are eight weeks from your own deadline. The editor accepts on one report, and does not ask you again.",
            stat_deltas: {},
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              SCI: -1,
              NET: -1
            },
            relationship_deltas: {},
            flags_set: ["thin_review"]
          }
        }
      },
      {
        label: "Take it, and take the full six weeks",
        stat_check: {
          stats: ["CO", "GR"],
          modifier: -0.05
        },
        outcomes: {
          success: {
            text: "Nothing you write is untrue and nothing you write is quick. Your measurement goes up as a preprint nine days before theirs clears review, and the priority conversation never has to be had.",
            stat_deltas: {
              CO: 0.5
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              SCI: 4,
              NET: 1
            },
            relationship_deltas: {},
            flags_set: ["slow_walked_a_review"]
          },
          failure: {
            text: "The editor chases twice, reassigns it, and then sees your preprint go up in the same week. Nothing is said to you formally. You are not asked to review for that journal again, and the other group works out the dates on their own.",
            stat_deltas: {},
            stress_delta: STRESS.MAJOR_SETBACK,
            reputation_deltas: {
              SCI: -3,
              NET: -3
            },
            relationship_deltas: {},
            flags_set: ["slow_walked_a_review", "caught_slow_walking"]
          }
        }
      }
    ]
  },
  {
    id: "nx_schedule_halved",
    title: "The run schedule comes back halved",
    text: "The facility loses a quarter of its operating budget. Staff costs do not move, so the whole cut comes out of operating weeks. Your six weeks are three, and three weeks answers half the question.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.EARLY_CAREER, STAGE.MID_CAREER, STAGE.SENIOR],
    age_range: [30, 62],
    weight: 3,
    cooldown_years: 4,
    max_fires: 2,
    choices: [
      {
        label: "Drop the scan, keep the discriminating points",
        stat_check: {
          stats: ["IN", "SM"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "You throw away two thirds of the parameter scan and keep the three operating points where the models actually disagree. Three weeks, one clean answer, and a proposal for the rest.",
            stat_deltas: {
              IN: 0.5
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: 4
            },
            relationship_deltas: {},
            flags_set: ["cut_to_the_physics"]
          },
          failure: {
            text: "You pick the wrong three points. The data are excellent and distinguish nothing, which is obvious in April and was not in January.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              SCI: -1
            },
            relationship_deltas: {},
            flags_set: []
          }
        }
      },
      {
        label: "Take the three weeks, queue for the rest",
        outcomes: {
          success: {
            text: "Half a result and a place near the front of next year's queue. Next year the budget is flat, the queue is longer, and every group in the building was told the same thing.",
            stat_deltas: {},
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {
              SCI: 1
            },
            relationship_deltas: {},
            flags_set: ["queued_for_next_cycle"]
          }
        }
      },
      {
        label: "Share the block with the competing group",
        stat_check: {
          stats: ["CH", "CO"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "Two teams, one machine, shifts alternating at eight and twenty, and one wall conditioning recipe you both agree to live with. You each get more shots than either was allocated, and a co-authorship neither of you planned on.",
            stat_deltas: {
              CH: 0.3,
              CO: 0.5
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              NET: 4,
              SCI: 2
            },
            relationship_deltas: {},
            flags_set: ["shared_the_block"]
          },
          failure: {
            text: "Their run plan needs a different fuelling configuration, and reconditioning the wall after each swap costs the better part of a day. You both end with less than you would have had alone, and you are both unfailingly polite about it.",
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
      }
    ]
  },
  {
    id: "nx_erratum",
    title: "A factor of two, four years late",
    text: "A student redoing your old analysis finds the neutron flux normalisation high by a factor of two. The conclusion survives it. Two of the numbers in the abstract do not, and your renewal panel meets in three weeks.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.EARLY_CAREER, STAGE.MID_CAREER, STAGE.SENIOR],
    age_range: [32, 62],
    weight: 2,
    cooldown_years: 5,
    max_fires: 1,
    choices: [
      {
        label: "File the erratum before the panel meets",
        stat_check: {
          stats: ["SM", "CH"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "Four paragraphs in the journal and a note to the nine groups working from your numbers. Two of them thank you. One had already found it and had said nothing to anyone. The panel reads it as somebody who checks.",
            stat_deltas: {
              SM: 0.3,
              GR: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {
              SCI: 3
            },
            relationship_deltas: {},
            flags_set: ["filed_erratum", "honest_operator"]
          },
          failure: {
            text: "One panel member treats the erratum as a reason to look at the rest of the analysis and spends the meeting doing it. The rest is fine. The renewal comes back at eighty percent, for two years instead of three.",
            stat_deltas: {
              GR: 0.5
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              SCI: 1,
              NET: -2
            },
            relationship_deltas: {},
            flags_set: ["filed_erratum", "honest_operator"]
          }
        }
      },
      {
        label: "Correct it quietly in the follow-up",
        stat_check: {
          stats: ["SM"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "The right normalisation appears in the next paper without comment and the field absorbs it without noticing. The renewal goes through at full ask. The old abstract is still wrong and still cited, and you know which figure it is in.",
            stat_deltas: {
              SM: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {
              NET: 3
            },
            relationship_deltas: {},
            flags_set: ["quiet_correction"]
          },
          failure: {
            text: "A referee asks in one sentence why the numbers differ from your earlier paper. You file the erratum four months later than you could have, with an audience, and the panel has already met.",
            stat_deltas: {},
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              SCI: -2,
              NET: -1
            },
            relationship_deltas: {},
            flags_set: ["filed_erratum", "caught_correcting_quietly"]
          }
        }
      }
    ]
  },
  {
    id: "nx_night_shift",
    title: "Somebody has to take the night",
    text: "Session leader, 22:00 to 06:00, again. The man who would normally take it has a daughter in a school play, which you find out by accident and not from him.",
    type: EVENT_TYPE.RANDOM,
    stage: [STAGE.EARLY_CAREER, STAGE.MID_CAREER],
    age_range: [29, 50],
    weight: 3,
    cooldown_years: 3,
    max_fires: 3,
    choices: [
      {
        label: "Take the shift, say nothing about it",
        outcomes: {
          success: {
            text: "You run the night, get four usable shots and a headache that lasts into Saturday. He hears about it from someone else in the spring and never quite works out how to say thank you, so he does not.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              NET: 1
            },
            relationship_deltas: {},
            flags_set: []
          }
        }
      },
      {
        label: "Give it to the postdoc who wants the experience",
        stat_check: {
          stats: ["CH", "IN"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "She runs it clean, calls you twice, and does not need a third. She gets nine shots where you would have got four, because she is not tired. Within two years she is the first name on the night rota and has stopped saying yes as fast.",
            stat_deltas: {
              CH: 0.3
            },
            stress_delta: STRESS.MENTORING,
            reputation_deltas: {
              NET: 3,
              SCI: 1
            },
            relationship_deltas: {},
            flags_set: ["grew_the_postdoc"]
          },
          failure: {
            text: "She runs it clean until 03:00, when the Thomson laser trips and she waits ninety minutes before calling you. You lose the rest of the night, and she does not put her name down for a night session again that year.",
            stat_deltas: {},
            stress_delta: STRESS.STANDARD_SETBACK,
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
    id: "nx_tbr_summary",
    title: "The number in the summary",
    text: "The design report puts the tritium breeding ratio at 1.15. Your own neutronics gives 1.05 with a spread that touches unity, and the difference lives in an appendix nobody opens.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.MID_CAREER, STAGE.SENIOR],
    age_range: [42, 63],
    weight: 2,
    cooldown_years: 5,
    max_fires: 1,
    choices: [
      {
        label: "Insist the range goes in the summary",
        stat_check: {
          stats: ["SM", "CH"],
          modifier: -0.05
        },
        outcomes: {
          success: {
            text: "The summary carries the range and one sentence on what would close it, which is better lead and lithium-6 cross sections and an honest count of the penetrations. Two external reviewers call it the most useful page in the document. The programme office calls it unhelpful, in that word.",
            stat_deltas: {
              SM: 0.5,
              CH: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: 5,
              NET: -2
            },
            relationship_deltas: {},
            flags_set: ["forced_the_range", "honest_operator"]
          },
          failure: {
            text: "You are outvoted by people who are not wrong about how a range gets read by a legislature. The 1.15 stands with a footnote you wrote, and you keep the email chain.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              SCI: 1,
              NET: -1
            },
            relationship_deltas: {},
            flags_set: ["kept_the_email_chain"]
          }
        }
      },
      {
        label: "Let it stand and put the objection in the file",
        outcomes: {
          success: {
            text: "The report ships with the optimistic number and a memo in the record with your name and the date on it. The chapter lead thanks you for not making it a fight. Whether anyone opens the memo is not something you get to find out.",
            stat_deltas: {},
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {
              NET: 2
            },
            relationship_deltas: {},
            flags_set: ["wrote_the_memo"]
          }
        }
      }
    ]
  },
  {
    id: "nx_disruption_log",
    title: "The disruption at 04:12",
    text: "The density request goes past the point where the edge radiates faster than you can heat it. The current quench is fast enough to make a runaway beam, and it melts a channel across a first wall panel and takes out the diagnostic mirror behind it. The shift log will show who signed off the density, and it was you.",
    type: EVENT_TYPE.RANDOM,
    stage: [STAGE.EARLY_CAREER, STAGE.MID_CAREER],
    age_range: [29, 50],
    weight: 2,
    cooldown_years: 3,
    max_fires: 2,
    choices: [
      {
        label: "Write the log entry plainly before you leave",
        outcomes: {
          success: {
            text: "Parameters, reasoning and your name, in the log, before you go home. The post-mortem stays technical rather than personal, which is what plain log entries buy and the only thing they buy.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.STANDARD_SETBACK,
            reputation_deltas: {
              SCI: 1
            },
            relationship_deltas: {},
            flags_set: ["plain_log_entry", "honest_operator"]
          }
        }
      },
      {
        label: "Have the analysis ready before the operations meeting",
        stat_check: {
          stats: ["SM", "IN"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "You show the meeting that the mitigation trigger was tuned on a machine with a different wall, and that the gas injection fired two hundred milliseconds after the point where it could have done anything. The machine gets a rewritten trigger out of one ruined panel.",
            stat_deltas: {
              SM: 0.5,
              IN: 0.3
            },
            stress_delta: STRESS.SUCCESS,
            reputation_deltas: {
              SCI: 3
            },
            relationship_deltas: {},
            flags_set: ["fixed_the_mitigation"]
          },
          failure: {
            text: "The analysis is right and lands as a defence, because you gave it before anyone asked for it. The panel still cost eleven operating days, and now the room thinks of you when the subject comes up.",
            stat_deltas: {},
            stress_delta: STRESS.STANDARD_SETBACK,
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
    id: "nx_prize_nomination",
    title: "The nomination packet",
    text: "The society wants nominations for its mid-career prize. Yours would be credible. So would the one you could write for Iwasaki, whose theory made half your results possible and whose talks are always at eight in the morning.",
    type: EVENT_TYPE.DECISION,
    stage: [STAGE.MID_CAREER, STAGE.SENIOR],
    age_range: [41, 62],
    weight: 2,
    cooldown_years: 5,
    max_fires: 1,
    choices: [
      {
        label: "Write the case for Iwasaki",
        stat_check: {
          stats: ["CH", "CO"],
          modifier: 0
        },
        outcomes: {
          success: {
            text: "He wins it, appears genuinely bewildered by it, and spends his acceptance talk on somebody else's work. The nominator's name is not printed anywhere. Two of the four people who wrote supporting letters now answer your email the same day.",
            stat_deltas: {
              CH: 0.3
            },
            stress_delta: STRESS.RELATIONSHIP_POSITIVE,
            reputation_deltas: {
              NET: 4
            },
            relationship_deltas: {
              npc_iwasaki: RELD.HELPED
            },
            flags_set: ["nominated_someone_else"]
          },
          failure: {
            text: "It goes to a better-known candidate with a thinner case. Iwasaki hears he was nominated and by whom, and thanks you once, briefly, in a corridor.",
            stat_deltas: {},
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {
              NET: 1
            },
            relationship_deltas: {
              npc_iwasaki: RELD.SPOKE_WELL
            },
            flags_set: []
          }
        }
      },
      {
        label: "Let a colleague put your name forward",
        stat_check: {
          stats: ["CO"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "You win it. The citation is accurate and generous and mentions the theory work as context. You spend most of the reception thinking about who is not in the room.",
            stat_deltas: {
              CO: 0.5
            },
            stress_delta: STRESS.MAJOR_SUCCESS,
            reputation_deltas: {
              SCI: 4,
              PUB: 2
            },
            relationship_deltas: {
              npc_iwasaki: RELD.COMPETED_WON
            },
            flags_set: ["took_the_prize"]
          },
          failure: {
            text: "Shortlisted, and it goes elsewhere. A shortlisting is a line on a CV nobody reads and a fortnight of checking your email you would like back.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.MINOR_SETBACK,
            reputation_deltas: {
              SCI: 1
            },
            relationship_deltas: {},
            flags_set: []
          }
        }
      },
      {
        label: "Skip the cycle entirely",
        outcomes: {
          success: {
            text: "The packet is forty pages of letters, citation analysis and a chase for two signatures, and skipping it gives you six weeks back in the middle of the run season. You use them. Nobody from your group is on the list this year.",
            stat_deltas: {
              IN: 0.3
            },
            stress_delta: STRESS.REST,
            reputation_deltas: {
              NET: -1
            },
            relationship_deltas: {},
            flags_set: ["skipped_the_cycle"]
          }
        }
      }
    ]
  },
  {
    id: "nx_inbox_midnight",
    title: "Two hundred and forty unread",
    text: "The inbox has become a second job with no shot list and no end to it. Somewhere in there is a student asking a real question, three weeks ago.",
    type: EVENT_TYPE.RANDOM,
    stage: [STAGE.EARLY_CAREER, STAGE.MID_CAREER, STAGE.SENIOR],
    age_range: [30, 63],
    weight: 3,
    cooldown_years: 3,
    max_fires: 3,
    choices: [
      {
        label: "Clear it on a Sunday",
        outcomes: {
          success: {
            text: "Six hours, one Sunday, and an empty folder that is full again by Wednesday. You find the student's question and answer it three weeks late, at length, which helps him and does not undo the three weeks.",
            stat_deltas: {
              GR: 0.3
            },
            stress_delta: STRESS.HIGH_WORKLOAD,
            reputation_deltas: {
              NET: 1
            },
            relationship_deltas: {},
            flags_set: []
          }
        }
      },
      {
        label: "Answer the five that matter, archive the rest",
        stat_check: {
          stats: ["IN"],
          modifier: 0.05
        },
        outcomes: {
          success: {
            text: "You get good at reading a subject line in a second and wrong about one in twenty. Your evenings come back, and the analysis you have been carrying since March goes out in June instead of never.",
            stat_deltas: {
              IN: 0.3
            },
            stress_delta: STRESS.REST,
            reputation_deltas: {
              SCI: 2
            },
            relationship_deltas: {},
            flags_set: ["triages_ruthlessly"]
          },
          failure: {
            text: "One of the archived ones was a collaboration invitation with a deadline on it. You find it in November, which is the wrong month to find it.",
            stat_deltas: {},
            stress_delta: STRESS.MINOR_SETBACK,
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
];
