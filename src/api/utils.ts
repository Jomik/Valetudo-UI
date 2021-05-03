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
