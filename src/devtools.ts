import { Injector } from "./injector"
import { InjectorListener } from "./injectorListener"


export interface DevHooks {
    enabled?: boolean
    emit: (event: string, ...payload: any[]) => void
    on: (event: string, handler: Function) => void
    once: (event: string, handler: Function) => void
    off: (event: string, handler: Function) => void
    rootInjectors: Injector[]
}

const enum DevHookEvents {
    InjectorCreated = 'injector:created',
    InjectorDisposed = 'injector:disposed',

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
export function ensureInit() {
    if (!devToolsInjected) {
        if (typeof window !== 'undefined') {
            _injectDevHooks(window);
        }
        devToolsInjected = true;
    }
}

export function createHookListener(): InjectorListener {
    return {
        injectorCreated(injector) {
            ensureInit();
            _emit(DevHookEvents.InjectorCreated, injector);
        },
        injectorDisposed(injector) {
            ensureInit();
            _emit(DevHookEvents.InjectorDisposed, injector);
        },
        dependencyAdded(identifier, item) {
            
        },
        dependencyFetched(identifier) {
            
        },
        dependencyRemoved(identifier) {
            
        },
        lazyDependencyInitialized(identifier) {
            
        },
        asyncDependencyReady(identifier) {
            
        },
    }
}

