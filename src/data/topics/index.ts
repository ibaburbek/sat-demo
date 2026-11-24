import { TopicContent } from '../../types/curriculum';
import { LINEAR_EQUATIONS_CONTENT } from './linearEquations';
import { SYSTEMS_OF_EQUATIONS_CONTENT } from './systemsOfEquations';
import { QUADRATIC_EQUATIONS_CONTENT } from './quadraticEquations';

export const TOPIC_CONTENT_MAP: Record<string, TopicContent> = {
  'alg-linear-one-var': LINEAR_EQUATIONS_CONTENT,
  'alg-systems-linear': SYSTEMS_OF_EQUATIONS_CONTENT,
  'adv-quadratic-equations': QUADRATIC_EQUATIONS_CONTENT,
};

export function getTopicContent(topicId: string): TopicContent | undefined {
  return TOPIC_CONTENT_MAP[topicId];
}

export function getAllCompleteTopicIds(): string[] {
  return Object.keys(TOPIC_CONTENT_MAP);
}
