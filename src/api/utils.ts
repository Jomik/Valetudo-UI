import { RobotAttribute, RobotAttributeClass } from './RawRobotState';

export const getAttributes = <C extends RobotAttributeClass>(
  clazz: C,
  attributes: RobotAttribute[]
): Extract<RobotAttribute, { __class: C }>[] => {
  const res = attributes.filter(
    (x): x is Extract<RobotAttribute, { __class: C }> => x.__class === clazz
  );

  if (res.length === 0) {
    throw new Error(`Could not find attribute of type ${clazz}`);
  }

  return res;
};
