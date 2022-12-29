
import { normalizeFactoryDeps } from './dependencyDescriptor';
import { getDependencies } from './decorators';
import { normalizeForwardRef } from './dependencyForwardRef';
import { prettyPrintIdentifier } from './dependencyItem';


export const innerMethods = {
    normalizeFactoryDeps,
    getDependencies,
    normalizeForwardRef,
    prettyPrintIdentifier,
}


export type InnerMethods = typeof innerMethods;