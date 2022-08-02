import { DependencyIdentifier } from "./dependencyIdentifier";
import { DependencyItem } from "./dependencyItem";
import { Injector } from "./injector";

/**
 * Injector 相关事件的监听
 */
export interface InjectorListener {
    injectorCreated(injector: Injector): void;
    injectorDisposed(injector: Injector): void;
    dependencyAdded<T>(identifier: DependencyIdentifier<T>, item: DependencyItem<T> | T | null): void;
    dependencyRemoved<T>(identifier: DependencyIdentifier<T>): void;
    dependencyFetched<T>(identifier: DependencyIdentifier<T>): void;
    lazyDependencyInitialized<T>(identifier: DependencyIdentifier<T>): void;
    asyncDependencyReady<T>(identifier: DependencyIdentifier<T>): void;
}