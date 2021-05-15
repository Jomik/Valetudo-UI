import { RobotAttribute, RobotAttributeClass } from './RawRobotState';

export const isAttribute = <C extends RobotAttributeClass>(
  clazz: C
): ((
  attribute: RobotAttribute
) => attribute is Extract<RobotAttribute, { __class: C }>) => (
  attribute
): attribute is Extract<RobotAttribute, { __class: C }> =>
  attribute.__class === clazz;

export const replaceAttribute = <C extends RobotAttributeClass>(
  clazz: C,
  filter: (attribute: Extract<RobotAttribute, { __class: C }>) => boolean,
  replacer: (
    attribute: Extract<RobotAttribute, { __class: C }>
  ) => Extract<RobotAttribute, { __class: C }>
): ((attributes: RobotAttribute[]) => RobotAttribute[]) => (attributes) => {
  return attributes.map((attribute) => {
    if (!isAttribute(clazz)(attribute) || !filter(attribute)) {
      return attribute;
    }

    return replacer(attribute);
  });
};

// eslint-disable-next-line @typescript-eslint/ban-types
export const floorObject = <T extends object>(obj: T): T => {
  if (Array.isArray(obj)) {
    return obj.map(floorObject) as T;
  }

  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => {
      if (typeof v === 'number') {
        return [k, Math.floor(v)];
      }
      if (typeof v === 'object' && v !== null) {
        if (Array.isArray(v)) {
          return [k, v.map(floorObject)];
        }

        return [k, floorObject(v)];
      }
      return [k, v];
    })
  ) as T;
};
