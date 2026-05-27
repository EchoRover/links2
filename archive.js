// ============================================================
// archive.js — past-semester course links.
// Links recovered verbatim from git history:
//   Year 2 · Sem 1  → commit 6a8437d^   (TimeTable PDF: "2nd year EEN Sem 1")
//   Year 2 · Sem 2  → commit 313ef98^   (most complete Sem 4 version)
// credits + ltp added from transcript (Sem I/II 2025-26).
// Relies on shared.js (renderCourseLinks, theme, footer quote, botanicals).
// ============================================================

const archiveData = {
  // ---------------- Year 2 · Semester 1 (term: 18 cr) ----------------
  sem1: {
    "AENL220 (Heat)": {
      credits: 4, ltp: "3-1-0",
      links: {
        "Lecture slides": "https://iitdabudhabi.sharepoint.com/sites/AENL220_jacpcl/Class%20Materials/Forms/AllItems.aspx",
        Quiz: "https://iitdabudhabi.sharepoint.com/:f:/s/AENL220_jacpcl/Ene8Rq62J5JEonz9fQsD5BUBIJLmyXtU-onfgvHZgCNK4g?e=T6SezX",
        Tutorials: "https://iitdabudhabi.sharepoint.com/:f:/s/AENL220_jacpcl/EtURNCymC25FqStyIHHQjH8BzKEl9InbYIHEWA3reHm2CQ?e=w8iQBg"
      }
    },
    "AAPL105 (Mech)": {
      credits: 4, ltp: "3-1-0",
      links: {
        Blackboard: "https://iida.blackboard.com/ultra/courses/_38_1/outline"
      }
    },
    "AENL210 (Thermo)": {
      credits: 4, ltp: "3-1-0",
      links: {
        Blackboard: "https://iida.blackboard.com/ultra/courses/_39_1/outline",
        Lectures: "https://iitdabudhabi-my.sharepoint.com/:f:/g/personal/kkant_iitdabudhabi_ac_ae/Enl1qAazZR9BiFn9yuRHZl4Be2lylwrBb1NKZ_ew9EDn7Q?e=JzixUb",
        "Assig/Quiz/Tut": "https://iitdabudhabi-my.sharepoint.com/:f:/g/personal/kkant_iitdabudhabi_ac_ae/EmyiV-znPk9NtH9FoIu7GREBj0c8bxilcB5rOI_EQgTnkA?e=MfniI6",
        "Assig/Quiz/Tut (Solution)": "https://iitdabudhabi-my.sharepoint.com/:f:/g/personal/kkant_iitdabudhabi_ac_ae/Es8ZXG4JDGJBl8iwEl7fmHwBu-cJIzobmNyaq4GFLzK5NQ?e=IBLE0E"
      }
    },
    "AENL222 (Electro & Micro)": {
      credits: 3, ltp: "2-0-2",
      links: {
        Onedrive: "https://iitdabudhabi-my.sharepoint.com/personal/anandarup_iitdabudhabi_ac_ae/_layouts/15/onedrive.aspx?id=/personal/anandarup_iitdabudhabi_ac_ae/Documents/AENL222_for_sharing&ga=1",
        "Lectures (Slides)": "https://iitdabudhabi-my.sharepoint.com/:f:/r/personal/anandarup_iitdabudhabi_ac_ae/Documents/AENL222_for_sharing/lecture_slides?csf=1&web=1&e=mHx3jp",
        "Lectures (Vids)": "https://iitdabudhabi-my.sharepoint.com/:f:/r/personal/anandarup_iitdabudhabi_ac_ae/Documents/AENL222_for_sharing/lecture_videos?csf=1&web=1&e=hZFX1z",
        "Problem Sheets": "https://iitdabudhabi-my.sharepoint.com/:f:/r/personal/anandarup_iitdabudhabi_ac_ae/Documents/AENL222_for_sharing/problem_sheet?csf=1&web=1&e=1TktU9"
      }
    },
    "AENL338 (AI)": {
      credits: 3, ltp: "3-0-0",
      links: {
        Blackboard: "https://iida.blackboard.com/ultra/courses/_6_1/outline"
      }
    }
  },

  // ---------------- Year 2 · Semester 2 (term: 19 cr) ----------------
  sem2: {
    "AENL200 (CET)": {
      credits: 4, ltp: "3-1-0",
      links: {
        Blackboard: "https://iida.blackboard.com/ultra/courses/_106_1/outline",
        OneDrive: "https://iitdabudhabi-my.sharepoint.com/:f:/g/personal/kkant_iitdabudhabi_ac_ae/IgA1z2c0PZS7SpSKP8KdWAvxARnQrbKCoolunTP-2x1HJfo?e=A5mbyu"
      }
    },
    "AENL223 (Materials Enrgy Sys)": {
      credits: 4, ltp: "3-1-0",
      links: {
        Blackboard: "https://iida.blackboard.com/ultra/courses/_107_1/outline",
        OneDrive: "https://iitdabudhabi-my.sharepoint.com/:f:/g/personal/nkhare_iitdabudhabi_ac_ae/IgBSoUudo8CNSpwJL0ZsdkgmAe_E_AJzQ32W1YNAIQvlSSA?e=MKXG7H"
      }
    },
    "AENL202 (RET)": {
      credits: 4, ltp: "3-1-0",
      links: {
        Blackboard: "https://iida.blackboard.com/ultra/courses/_108_1/outline",
        OwnCloud: "https://owncloud.iitd.ac.in/nextcloud/index.php/s/43MTJGEktM4kcFM"
      }
    },
    "AENL224 (Elec Mch)": {
      credits: 3, ltp: "2-1-0",
      links: {
        Blackboard: "https://iida.blackboard.com/ultra/courses/_109_1/outline"
      }
    },
    "AHUL 213 (Macro Economics)": {
      credits: 4, ltp: "3-1-0",
      links: {
        Blackboard: "https://iida.blackboard.com/ultra/courses/_110_1/outline",
        Wordpress: "https://jayanjthomas.wordpress.com/teaching/macroeconomics-for-undergraduates/"
      }
    }
  }
};

// ================= INIT =================
// (theme, footer quote, botanicals handled by shared.js)
window.addEventListener("DOMContentLoaded", () => {
  renderCourseLinks("#sem1 .links", archiveData.sem1);
  renderCourseLinks("#sem2 .links", archiveData.sem2);
});
