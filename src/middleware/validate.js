import { localizeMessage } from '../utils/messages.js';

const TYPE_LABELS = {
  ru: {
    string: 'строка',
    number: 'число',
    integer: 'целое число',
    boolean: 'булево значение',
    object: 'объект',
    array: 'массив',
    date: 'дата',
    bigint: 'большое целое',
    undefined: 'не указано',
    null: 'null'
  },
  ky: {
    string: 'сап',
    number: 'сан',
    integer: 'бүтүн сан',
    boolean: 'логикалык маани',
    object: 'объект',
    array: 'тизме',
    date: 'дата',
    bigint: 'чоң бүтүн сан',
    undefined: 'көрсөтүлгөн эмес',
    null: 'null'
  }
};

function formatPath(path, locale) {
  if (path.length) {
    return path.join('.');
  }

  return locale === 'ky' ? 'сурамдын денеси' : 'тело запроса';
}

function getTypeLabel(type, locale) {
  return TYPE_LABELS[locale][type] || type;
}

function getTooSmallMessage(issue, locale) {
  if (locale === 'ky') {
    if (issue.type === 'string') {
      if (issue.exact) {
        return `узундугу так ${issue.minimum} белги болушу керек`;
      }
      return `минималдуу узундук: ${issue.minimum} белги`;
    }

    if (issue.type === 'array') {
      if (issue.exact) {
        return `так ${issue.minimum} элемент болушу керек`;
      }
      return `кеминде ${issue.minimum} элемент болушу керек`;
    }

    if (issue.type === 'number' || issue.type === 'bigint') {
      const comparator = issue.inclusive ? 'кем эмес' : 'чоң';
      return `маани ${comparator} ${issue.minimum} болушу керек`;
    }

    return 'маани өтө кичине';
  }

  if (issue.type === 'string') {
    if (issue.exact) {
      return `длина должна быть ровно ${issue.minimum} символов`;
    }
    return `минимальная длина: ${issue.minimum} символов`;
  }

  if (issue.type === 'array') {
    if (issue.exact) {
      return `должно быть ровно ${issue.minimum} элементов`;
    }
    return `должно быть минимум ${issue.minimum} элементов`;
  }

  if (issue.type === 'number' || issue.type === 'bigint') {
    const comparator = issue.inclusive ? 'не меньше' : 'больше';
    return `значение должно быть ${comparator} ${issue.minimum}`;
  }

  return 'значение слишком маленькое';
}

function getTooBigMessage(issue, locale) {
  if (locale === 'ky') {
    if (issue.type === 'string') {
      if (issue.exact) {
        return `узундугу так ${issue.maximum} белги болушу керек`;
      }
      return `максималдуу узундук: ${issue.maximum} белги`;
    }

    if (issue.type === 'array') {
      if (issue.exact) {
        return `так ${issue.maximum} элемент болушу керек`;
      }
      return `${issue.maximum} элементтен ашпашы керек`;
    }

    if (issue.type === 'number' || issue.type === 'bigint') {
      const comparator = issue.inclusive ? 'көп эмес' : 'кичине';
      return `маани ${comparator} ${issue.maximum} болушу керек`;
    }

    return 'маани өтө чоң';
  }

  if (issue.type === 'string') {
    if (issue.exact) {
      return `длина должна быть ровно ${issue.maximum} символов`;
    }
    return `максимальная длина: ${issue.maximum} символов`;
  }

  if (issue.type === 'array') {
    if (issue.exact) {
      return `должно быть ровно ${issue.maximum} элементов`;
    }
    return `должно быть не больше ${issue.maximum} элементов`;
  }

  if (issue.type === 'number' || issue.type === 'bigint') {
    const comparator = issue.inclusive ? 'не больше' : 'меньше';
    return `значение должно быть ${comparator} ${issue.maximum}`;
  }

  return 'значение слишком большое';
}

function getIssueMessage(issue, locale) {
  switch (issue.code) {
    case 'invalid_type':
      if (issue.received === 'undefined') {
        return locale === 'ky' ? 'милдеттүү талаа' : 'обязательное поле';
      }

      return locale === 'ky'
        ? `"${getTypeLabel(issue.expected, locale)}" түрү күтүлөт`
        : `ожидается тип "${getTypeLabel(issue.expected, locale)}"`;
    case 'invalid_string':
      if (issue.validation === 'email') {
        return locale === 'ky' ? 'туура email болушу керек' : 'должен быть корректным email';
      }

      if (issue.validation === 'url') {
        return locale === 'ky' ? 'туура URL болушу керек' : 'должен быть корректным URL';
      }

      return locale === 'ky' ? 'туура эмес сап' : 'некорректная строка';
    case 'too_small':
      return getTooSmallMessage(issue, locale);
    case 'too_big':
      return getTooBigMessage(issue, locale);
    case 'invalid_enum_value':
      return locale === 'ky'
        ? `уруксат берилген маанилер: ${issue.options.join(', ')}`
        : `допустимые значения: ${issue.options.join(', ')}`;
    case 'unrecognized_keys':
      return locale === 'ky'
        ? `ашыкча талаалар табылды: ${issue.keys.join(', ')}`
        : `обнаружены лишние поля: ${issue.keys.join(', ')}`;
    default:
      if (issue.message && typeof issue.message === 'string') {
        return localizeMessage(issue.message)[locale];
      }

      return locale === 'ky' ? 'туура эмес маани' : 'некорректное значение';
  }
}

function buildValidationMessage(issues, locale) {
  return issues.map((issue) => `${formatPath(issue.path, locale)}: ${getIssueMessage(issue, locale)}`).join('; ');
}

export function validateBody(schema) {
  return (req, _res, next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const localizedMessage = {
        ru: buildValidationMessage(parsed.error.issues, 'ru'),
        ky: buildValidationMessage(parsed.error.issues, 'ky')
      };

      const err = new Error(localizedMessage.ru);
      err.status = 400;
      err.localizedMessage = localizedMessage;
      return next(err);
    }

    req.body = parsed.data;
    return next();
  };
}
