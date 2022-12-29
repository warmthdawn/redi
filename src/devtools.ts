import { Injector } from "./injector"
import { InjectorListener } from "./injectorListener"
import { InnerMethods, innerMethods } from "./innerMethods"


export interface DevHooks {
    enabled?: boolean
    emit: (event: string, ...payload: any[]) => void
    on: (event: string, handler: (...payload: any) => void) => void
    once: (event: string, handler: (...payload: any) => void) => void
    off: (event: string, handler: (...payload: any) => void) => void
    rootInjectors: Map<number, Injector>,
    innterMethods?: InnerMethods,
}

const enum DevHookEvents {
    InjectorCreated = 'injector:created',
    InjectorDisposed = 'injector:disposed',
    DependencyAdded = 'dependency:added',
    DependencyRemoved = 'dependency:removed',
    DependencyFetched = 'dependency:fetched',
    LazyDependencyInitialized = 'dependency:lazy-init', 
    AsyncDependencyReady = 'dependency:async-ready', 
}


let devToolsNotInstalled = false;

let devHooks: DevHooks | undefined;

let pendingMessages: { event: string; payload: any[] }[] = [];

let devToolsInjected = false;


/**
 * 初始化 devHooks
 * @param target global对象
 */
function _injectDevHooks(target: any) {
    function injectDevHooks(hooks: DevHooks | undefined) {
        if (hooks) {
            console.log('[redi-dev] injecting devtools', hooks);
            devHooks = hooks;
            pendingMessages.forEach(({ event, payload }) => {

                devHooks?.emit(event, ...payload)
            });
            pendingMessages = [];

            // 如果依赖了不同版本的 redi，会因为 symbol 不一样 innterMethod 不能通用
            if (typeof hooks.innterMethods !== "undefined") {
                console.error("[redi-dev] you are using redi from different paths")
            } else {
                hooks.innterMethods = innerMethods;
            }
        }
    }

    injectDevHooks(target.__REDI_DEVTOOLS_GLOBAL_HOOKS__)

    // 加载完成，结束
    if (devHooks) {
        return;
    }

    // 还没加载插件
    if (!target.__REDI_DEVTOOLS_HOOK_CALLBACKS__) {
        target.__REDI_DEVTOOLS_HOOK_CALLBACKS__ = [];
    }
    target.__REDI_DEVTOOLS_HOOK_CALLBACKS__.push(() => {
        injectDevHooks(target.__REDI_DEVTOOLS_GLOBAL_HOOKS__)
    });


    // 10s还没有加载插件的，认为用户根本没装插件
    setTimeout(() => {
        if (!devHooks) {
            pendingMessages = [];
            target.__REDI_DEVTOOLS_HOOK_CALLBACKS__ = null;
            devToolsNotInstalled = true;
        }
    }, 10000);

}

/**
 * 发送事件
 */
function _emit(event: string, ...payload: any[]) {
    if (devHooks) {
        devHooks.emit(event, ...payload);
        return;
    }
    if (devToolsNotInstalled) {
        return;
    }
    pendingMessages.push({ event, payload })
}

/**
 * 确保 devTools 已经初始化
 */
export function ensureInit(): void {
    if (!devToolsInjected) {
        if (typeof window !== 'undefined') {
            _injectDevHooks(window);
        }
        devToolsInjected = true;
    }
}

export function createHookListener(injector: Injector): InjectorListener {
    return {
        injectorCreated() {
            ensureInit();
            _emit(DevHookEvents.InjectorCreated, injector);
        },
        injectorDisposed() {
            ensureInit();
            _emit(DevHookEvents.InjectorDisposed, injector);
        },
        dependencyAdded(identifier, item) {
            ensureInit();
            _emit(DevHookEvents.DependencyAdded, injector, identifier, item);
        },
        dependencyFetched(identifier) {
            ensureInit();
            _emit(DevHookEvents.DependencyFetched, injector, identifier);
        },
        dependencyRemoved(identifier) {
            ensureInit();
            _emit(DevHookEvents.DependencyRemoved, injector, identifier);
        },
        lazyDependencyInitialized(identifier) {
            ensureInit();
            _emit(DevHookEvents.LazyDependencyInitialized, injector, identifier);
        },
        asyncDependencyResolved(identifier, item, thing) {
            ensureInit();
            _emit(DevHookEvents.AsyncDependencyReady, injector, identifier, item, thing);
        },
    }
}
