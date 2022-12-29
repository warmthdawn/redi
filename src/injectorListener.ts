import { DependencyIdentifier } from "./dependencyIdentifier";
import { Ctor, DependencyItem, SyncDependencyItem } from "./dependencyItem";

/**
 * Injector 相关事件的监听
 */
export interface InjectorListener {
    injectorCreated(): void;
    injectorDisposed(): void;
    dependencyAdded<T>(identifier: DependencyIdentifier<T>, item: DependencyItem<T> | T | null): void;
    dependencyRemoved<T>(identifier: DependencyIdentifier<T>): void;
    dependencyFetched<T>(identifier: DependencyIdentifier<T>): void;
    lazyDependencyInitialized<T>(identifier: DependencyIdentifier<T>): void;
    asyncDependencyResolved<T>(identifier: DependencyIdentifier<T>, item: DependencyItem<T>, thing: T | Ctor<T> | [DependencyIdentifier<T>, SyncDependencyItem<T>]): void;
}