// Daily reminder popup — edit REMINDERS to set messages per day of week.
// 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
// Set any day to null (or omit) to show no popup that day.
//
// Example entry:
//   3: { title: "MNF Tonight!", message: "Chiefs vs Eagles kicks off at 8:20 ET on ESPN. Come back and brag after your pick!" }
export const REMINDERS = {
  0: null, // Sunday
  1: {title: "Challenge your Rivals!", message: "Click a Player Card, or send a link!\nProve you know more ball!"}, // Monday
  2: null, // Tuesday
  3: {title: "Achievements!", message: "Click your profile to view your achievements!"}, // Wednesday
  4: null, // Thursday
  5: null, // Friday
  6: null, // Saturday
};

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function showReminderPopup(reminder, storageKey) {
  const modal   = document.getElementById('reminderModal');
  const titleEl = document.getElementById('reminderModalTitle');
  const bodyEl  = document.getElementById('reminderModalBody');
  if (!modal || !titleEl || !bodyEl) return;

  titleEl.textContent = reminder.title   || 'Heads Up';
  bodyEl.textContent  = reminder.message || '';
  modal.style.display = 'flex';

  function dismiss() {
    modal.style.display = 'none';
    localStorage.setItem(storageKey, '1');
  }

  document.getElementById('reminderModalClose')?.addEventListener('click',   dismiss, { once: true });
  document.getElementById('reminderModalDismiss')?.addEventListener('click', dismiss, { once: true });
  document.getElementById('reminderModalBackdrop')?.addEventListener('click', dismiss, { once: true });
}

// On Sundays the weekly podium card (#sunday-podium-overlay) shows on the start
// screen at the same time the reminder would fire. Defer until after it's dismissed.
// Falls back after 8 seconds in case the podium never appears (no last-week data).
function afterPodiumDismissed(callback) {
  // Podium already dismissed this session — fire immediately
  if (sessionStorage.getItem('ft5_sunday_card_shown') === '1') {
    callback();
    return;
  }

  let podiumSeen = false;
  const fallback = setTimeout(() => {
    observer.disconnect();
    callback();
  }, 8000);

  const observer = new MutationObserver(() => {
    const overlay = document.getElementById('sunday-podium-overlay');
    if (overlay && !podiumSeen) {
      podiumSeen = true;
      clearTimeout(fallback);
    } else if (!overlay && podiumSeen) {
      observer.disconnect();
      callback();
    }
  });

  observer.observe(document.body, { childList: true });
}

// Dev helper — preview the popup from the browser console:
//   __devShowReminder()
//   __devShowReminder("MNF Tonight!", "Chiefs vs Eagles, 8:20 ET on ESPN.")
if (typeof window !== 'undefined') {
  window.__devShowReminder = (title = 'Test Reminder', message = 'This is a test reminder message.') => {
    showReminderPopup({ title, message }, `p5_reminder_dev_${Date.now()}`);
  };
}

export function initDailyReminder() {
  const reminder = REMINDERS[new Date().getDay()];
  if (!reminder) return;

  const storageKey = `p5_reminder_${getTodayKey()}`;
  if (localStorage.getItem(storageKey)) return;

  if (new Date().getDay() === 0) {
    afterPodiumDismissed(() => showReminderPopup(reminder, storageKey));
  } else {
    showReminderPopup(reminder, storageKey);
  }
}
