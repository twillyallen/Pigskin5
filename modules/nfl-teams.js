// All 32 NFL teams: abbreviation → { name, color, secondary, hashtag }
export const NFL_TEAMS = new Map([
  // AFC East
  ["BUF", { name: "Buffalo Bills",           color: "#00338D", secondary: "#C60C30", hashtag: "#BillsMafia"       }],
  ["MIA", { name: "Miami Dolphins",           color: "#008E97", secondary: "#FC4C02", hashtag: "#FinsUp"           }],
  ["NE",  { name: "New England Patriots",     color: "#002244", secondary: "#C60C30", hashtag: "#PatriotsNation"   }],
  ["NYJ", { name: "New York Jets",            color: "#125740", secondary: "#000000", hashtag: "#TakeFlight"       }],
  // AFC North
  ["BAL", { name: "Baltimore Ravens",         color: "#241773", secondary: "#9E7C0C", hashtag: "#RavensFlock"      }],
  ["CIN", { name: "Cincinnati Bengals",       color: "#FB4F14", secondary: "#000000", hashtag: "#WhoDey"           }],
  ["CLE", { name: "Cleveland Browns",         color: "#FF3C00", secondary: "#311D00", hashtag: "#DawgPound"        }],
  ["PIT", { name: "Pittsburgh Steelers",      color: "#101820", secondary: "#FFB612", hashtag: "#HereWeGo"         }],
  // AFC South
  ["HOU", { name: "Houston Texans",           color: "#03202F", secondary: "#A71930", hashtag: "#WeAreTexans"      }],
  ["IND", { name: "Indianapolis Colts",       color: "#002C5F", secondary: "#A2AAAD", hashtag: "#ForTheShoe"       }],
  ["JAX", { name: "Jacksonville Jaguars",     color: "#006778", secondary: "#9F792C", hashtag: "#DUUUVAL"          }],
  ["TEN", { name: "Tennessee Titans",         color: "#0C2340", secondary: "#4B92DB", hashtag: "#TitanUp"          }],
  // AFC West
  ["DEN", { name: "Denver Broncos",           color: "#FB4F14", secondary: "#002244", hashtag: "#BroncosCountry"   }],
  ["KC",  { name: "Kansas City Chiefs",       color: "#E31837", secondary: "#FFB81C", hashtag: "#ChiefsKingdom"    }],
  ["LV",  { name: "Las Vegas Raiders",        color: "#202020", secondary: "#A5ACAF", hashtag: "#RaiderNation"     }],
  ["LAC", { name: "Los Angeles Chargers",     color: "#0080C6", secondary: "#FFC20E", hashtag: "#BoltUp"           }],
  // NFC East
  ["DAL", { name: "Dallas Cowboys",           color: "#003594", secondary: "#869397", hashtag: "#CowboysNation"    }],
  ["NYG", { name: "New York Giants",          color: "#0B2265", secondary: "#A71930", hashtag: "#TogetherBlue"     }],
  ["PHI", { name: "Philadelphia Eagles",      color: "#004C54", secondary: "#A5ACAF", hashtag: "#FlyEaglesFly"     }],
  ["WAS", { name: "Washington Commanders",    color: "#5A1414", secondary: "#FFB612", hashtag: "#HTTC"             }],
  // NFC North
  ["CHI", { name: "Chicago Bears",            color: "#0B162A", secondary: "#C83803", hashtag: "#DaBears"          }],
  ["DET", { name: "Detroit Lions",            color: "#0076B6", secondary: "#B0B7BC", hashtag: "#OnePride"         }],
  ["GB",  { name: "Green Bay Packers",        color: "#233720", secondary: "#FFB612", hashtag: "#GoPackGo"         }],
  ["MIN", { name: "Minnesota Vikings",        color: "#4F2683", secondary: "#FFC62F", hashtag: "#SKOL"             }],
  // NFC South
  ["ATL", { name: "Atlanta Falcons",          color: "#A71930", secondary: "#000000", hashtag: "#RiseUp"           }],
  ["CAR", { name: "Carolina Panthers",        color: "#0085CA", secondary: "#101820", hashtag: "#KeepPounding"     }],
  ["NO",  { name: "New Orleans Saints",       color: "#3b3b3b", secondary: "#B6985A", hashtag: "#WhoDat"           }],
  ["TB",  { name: "Tampa Bay Buccaneers",     color: "#D50A0A", secondary: "#34302B", hashtag: "#GoBucs"           }],
  // NFC West
  ["ARI", { name: "Arizona Cardinals",        color: "#97233F", secondary: "#FFB612", hashtag: "#BirdGang"         }],
  ["LAR", { name: "Los Angeles Rams",         color: "#003594", secondary: "#FFA300", hashtag: "#RamsHouse"        }],
  ["SF",  { name: "San Francisco 49ers",      color: "#AA0000", secondary: "#B3995D", hashtag: "#FTTB"             }],
  ["SEA", { name: "Seattle Seahawks",         color: "#002244", secondary: "#69BE28", hashtag: "#GoHawks"          }],
  
  //Lindsay
  ["LIN", { name: "Lindsay the 🐐",         color: "#444444", secondary: "#ff3fc5", hashtag: "#IFuckingSuck"          }],
]);

// Alphabetically sorted array for <select> dropdowns
export const NFL_TEAMS_SORTED = [...NFL_TEAMS.entries()]
  .map(([abbr, t]) => ({ abbr, ...t }))
  .sort((a, b) => a.name.localeCompare(b.name));
