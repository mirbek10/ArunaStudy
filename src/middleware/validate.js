const TYPE_LABELS = {
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
};

function formatPath(path) {
  return path.length ? path.join('.') : 'тело запроса';
}

function getTypeLabel(type) {
  return TYPE_LABELS[type] || type;
}

function getTooSmallMessage(issue) {
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

function getTooBigMessage(issue) {
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

function getRussianIssueMessage(issue) {
  switch (issue.code) {
    case 'invalid_type':
      if (issue.received === 'undefined') {
        return 'обязательное поле';
      }
      return `ожидается тип "${getTypeLabel(issue.expected)}"`;
    case 'invalid_string':
      if (issue.validation === 'email') {
        return 'должен быть корректным email';
      }
      if (issue.validation === 'url') {
        return 'должен быть корректным URL';
      }
      return 'некорректная строка';
    case 'too_small':
      return getTooSmallMessage(issue);
    case 'too_big':
      return getTooBigMessage(issue);
    case 'invalid_enum_value':
      return `допустимые значения: ${issue.options.join(', ')}`;
    case 'unrecognized_keys':
      return `обнаружены лишние поля: ${issue.keys.join(', ')}`;
    default:
      return issue.message && /[А-Яа-яЁё]/.test(issue.message) ? issue.message : 'некорректное значение';
  }
}

export function validateBody(schema) {
  return (req, _res, next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const message = parsed.error.issues
        .map((issue) => `${formatPath(issue.path)}: ${getRussianIssueMessage(issue)}`)
        .join('; ');
      const err = new Error(message);
      err.status = 400;
      return next(err);
    }

    req.body = parsed.data;
    return next();
  };
}
