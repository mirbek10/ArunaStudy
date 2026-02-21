function text(value) {
  return String(value || '').trim();
}

function defaultOptionLabel(position) {
  return {
    ru: `Вариант ${position}`,
    ky: `Тандоо ${position}`
  };
}

function compareLocalizedText(left, right) {
  return text(left?.ru).toLowerCase() === text(right?.ru).toLowerCase() && text(left?.ky).toLowerCase() === text(right?.ky).toLowerCase();
}

export function normalizeLanguage(value) {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .split(',')[0]
    .split('-')[0];

  if (normalized === 'ky' || normalized === 'kg') return 'ky';
  if (normalized === 'ru') return 'ru';
  if (normalized === 'en') return 'en';
  return 'ru';
}

export function detectRequestLanguage(req) {
  const queryLang = req.query?.lang;
  const headerLang = req.headers?.['x-lang'];
  const acceptLang = req.headers?.['accept-language'];

  return normalizeLanguage(queryLang || headerLang || acceptLang || 'ru');
}

export function toLocalizedText(value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return {
      ru: text(value.ru),
      ky: text(value.ky)
    };
  }

  const shared = text(value);
  return { ru: shared, ky: shared };
}

export function localizedTextForLanguage(value, lang = 'ru') {
  const localized = toLocalizedText(value);

  if (lang === 'ky') {
    return localized.ky || localized.ru;
  }

  if (lang === 'en') {
    return localized.ru || localized.ky;
  }

  return localized.ru || localized.ky;
}

export function toLocalizedModule(moduleRow) {
  return {
    ...moduleRow,
    title: toLocalizedText(moduleRow.title),
    description: toLocalizedText(moduleRow.description)
  };
}

export function toModuleForLanguage(moduleRow, lang = 'ru') {
  const localized = toLocalizedModule(moduleRow);
  return {
    ...localized,
    title: localizedTextForLanguage(localized.title, lang),
    description: localizedTextForLanguage(localized.description, lang)
  };
}

export function toLocalizedQuestion(question, { includeCorrectOptionIndex = true } = {}) {
  const payload = {
    ...question,
    question: toLocalizedText(question.question)
  };

  const localizedOptions = Array.isArray(question.options)
    ? question.options.map((option) => toLocalizedText(option))
    : [];

  const legacyCorrectAnswer = question.correctAnswer ? toLocalizedText(question.correctAnswer) : null;

  if (localizedOptions.length === 0 && legacyCorrectAnswer) {
    localizedOptions.push(legacyCorrectAnswer);
  }

  while (localizedOptions.length < 4) {
    localizedOptions.push(defaultOptionLabel(localizedOptions.length + 1));
  }

  let correctOptionIndex = Number(question.correctOptionIndex);
  const hasValidIndex = Number.isInteger(correctOptionIndex) && correctOptionIndex >= 0 && correctOptionIndex < localizedOptions.length;

  if (!hasValidIndex) {
    if (legacyCorrectAnswer) {
      const foundIndex = localizedOptions.findIndex((option) => compareLocalizedText(option, legacyCorrectAnswer));
      if (foundIndex >= 0) {
        correctOptionIndex = foundIndex;
      } else {
        localizedOptions[0] = legacyCorrectAnswer;
        correctOptionIndex = 0;
      }
    } else {
      correctOptionIndex = 0;
    }
  }

  payload.options = localizedOptions;
  if (includeCorrectOptionIndex) {
    payload.correctOptionIndex = correctOptionIndex;
  }

  return payload;
}

export function toQuestionForLanguage(question, lang = 'ru', { includeCorrectOptionIndex = true } = {}) {
  const localized = toLocalizedQuestion(question, { includeCorrectOptionIndex });
  const payload = {
    ...localized,
    question: localizedTextForLanguage(localized.question, lang),
    options: (localized.options || []).map((option) => localizedTextForLanguage(option, lang))
  };

  if (!includeCorrectOptionIndex) {
    delete payload.correctOptionIndex;
  }

  return payload;
}

export function toLocalizedLesson(lesson, { includeTest = true, includeCorrectOptionIndex = true } = {}) {
  const payload = {
    ...lesson,
    title: toLocalizedText(lesson.title),
    content: toLocalizedText(lesson.content)
  };

  if (includeTest) {
    payload.test = (lesson.test || []).map((question) => toLocalizedQuestion(question, { includeCorrectOptionIndex }));
  }

  return payload;
}

export function toLessonForLanguage(lesson, lang = 'ru', { includeTest = true, includeCorrectOptionIndex = true } = {}) {
  const localized = toLocalizedLesson(lesson, { includeTest, includeCorrectOptionIndex });
  const payload = {
    ...localized,
    title: localizedTextForLanguage(localized.title, lang),
    content: localizedTextForLanguage(localized.content, lang)
  };

  if (includeTest) {
    payload.test = (localized.test || []).map((question) =>
      toQuestionForLanguage(question, lang, { includeCorrectOptionIndex })
    );
  }

  return payload;
}
