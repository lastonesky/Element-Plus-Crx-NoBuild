// AgelContextMenu 非构建版本
// 这是一个独立的Vue 3组件，可以直接在浏览器中使用
// 使用IIFE避免全局命名空间污染

(function () {
    'use strict';

    // 从Vue中解构所需的API，限制在当前作用域
    const { ref: vueRef, onMounted, onUnmounted, computed, reactive, watch, getCurrentInstance, nextTick, Teleport, Transition } = Vue;

    // 工具函数
    function throttle(func, delay) {
        let timer = null;
        return function (...args) {
            if (!timer) {
                timer = setTimeout(() => {
                    func.apply(this, args);
                    timer = null;
                }, delay);
            }
        };
    }

    // 响应式窗口尺寸
    let realtimeWindowWidth = vueRef(window.innerWidth);
    let reltimeWindowHeight = vueRef(window.innerHeight);

    const throttleWindowResizeWH = throttle(() => {
        realtimeWindowWidth.value = window.innerWidth;
        reltimeWindowHeight.value = window.innerHeight;
    }, 500);

    // AgelContextMenu 主组件
    const AgelContextMenu = {
        name: 'AgelContextMenu',
        components: {
            AgelIcon
        },
        props: {
            modelValue: {
                type: Boolean,
                default: false
            },
            x: {
                type: Number,
                default: 0
            },
            y: {
                type: Number,
                default: 0
            },
            menus: {
                type: Array,
                default: () => []
            },
            transition: {
                type: String,
                default: 'el-zoom-in-top'
            }
        },
        emits: ['update:modelValue', 'select'],
        setup(props, { emit }) {
            const menuRef = vueRef();
            const hoverIndex = vueRef(-1);
            const isRoot = getCurrentInstance()?.parent?.type?.name !== 'BaseTransition';

            const menuRect = reactive({
                width: 0,
                height: 0,
                paddingTop: 0,
                load: false,
                timer: 0
            });

            const subMenusXy = reactive([]);

            const xy = computed(() => {
                return { x: props.x, y: props.y };
            });

            const menuStyle = computed(() => {
                if (!isRoot) {
                    const maxX = realtimeWindowWidth.value - menuRect.width;
                    const maxY = reltimeWindowHeight.value - menuRect.height;
                    const obj = {
                        position: 'absolute'
                    };
                    if (props.x <= maxX && props.y <= maxY) {
                        return {
                            ...obj,
                            left: '100%',
                            top: 0 - menuRect.paddingTop + 'px'
                        };
                    } else if (props.x <= maxX && props.y > maxY) {
                        return {
                            ...obj,
                            left: '100%',
                            bottom: 0 - menuRect.paddingTop + 'px'
                        };
                    } else if (props.x > maxX && props.y <= maxY) {
                        return {
                            ...obj,
                            right: '0px',
                            top: '100%'
                        };
                    } else if (props.x > maxX && props.y > maxY) {
                        return {
                            ...obj,
                            right: '0px',
                            bottom: '100%'
                        };
                    }
                    return {};
                }

                const maxX = window.innerWidth - menuRect.width;
                const maxY = window.innerHeight - menuRect.height;
                return {
                    position: 'fixed',
                    top: Math.min(props.y, maxY) + 'px',
                    left: Math.min(props.x, maxX) + 'px'
                };
            });

            const menuData = computed(() => {
                return filterMenu(props.menus);
            });

            const hasIcon = computed(() => {
                return props.menus.some((v) => v.icon != undefined);
            });

            function hasSubMenu(menus = []) {
                return filterMenu(menus).length > 0;
            }

            function filterMenu(menus = []) {
                return menus.filter((v) => v.hidden !== true);
            }

            function hideMenu() {
                emit('update:modelValue', false);
            }

            function onSelect(menuItem, e) {
                if (hasSubMenu(menuItem.children)) {
                    e && e.stopPropagation();
                } else {
                    emit('select', menuItem);
                }
            }

            function updateMenuRect() {
                if (!menuRef.value) return;
                const clone = menuRef.value.cloneNode(true);
                clone.style.cssText = 'position: absolute; visibility: hidden; display: block;';
                document.body.appendChild(clone);
                menuRect.width = clone.offsetWidth;
                menuRect.height = clone.offsetHeight;
                menuRect.paddingTop = parseFloat(getComputedStyle(clone).paddingTop);
                document.body.removeChild(clone);
            }

            function calculateSubMenusXY() {
                if (!menuRef.value) return;
                const subMenus = menuRef.value.children;
                for (let i = 0; i < subMenus.length; i++) {
                    const element = subMenus[i];
                    const rect = element.getBoundingClientRect();
                    subMenusXy[i] = [rect.x + rect.width, rect.y + rect.height];
                    menuRect.load = true;
                }
            }

            watch(
                () => [props.menus],
                () => {
                    nextTick(() => updateMenuRect());
                },
                { immediate: true }
            );

            watch(
                () => [xy.value, props.modelValue],
                () => {
                    if (!props.modelValue) return;
                    clearTimeout(menuRect.timer);
                    menuRect.load = false;
                    menuRect.timer = setTimeout(calculateSubMenusXY, 310);
                }
            );

            onMounted(() => {
                if (isRoot) {
                    throttleWindowResizeWH();
                    document.addEventListener('click', hideMenu);
                    window.addEventListener('resize', throttleWindowResizeWH);
                }
            });

            onUnmounted(() => {
                if (isRoot) {
                    document.removeEventListener('click', hideMenu);
                    window.removeEventListener('resize', throttleWindowResizeWH);
                }
            });

            return {
                menuRef,
                hoverIndex,
                isRoot,
                menuRect,
                subMenusXy,
                menuStyle,
                menuData,
                hasIcon,
                hasSubMenu,
                onSelect
            };
        },
        template: `
    <Teleport v-if="menuData.length > 0" to="body" :disabled="!isRoot">
      <Transition :name="transition">
        <div
          ref="menuRef"
          class="agel-context-menu"
          v-show="modelValue"
          :style="menuStyle"
          @mouseleave="hoverIndex = -1"
          @contextmenu.prevent
        >
          <div
            v-for="(item, index) in menuData"
            :key="index"
            :class="[
              'agel-context-menu-item',
              item.className,
              {
                __divided: item.divided,
                __disabled: item.disabled,
                __hasIcon: hasIcon,
                __hasChildren: hasSubMenu(item.children)
              }
            ]"
            @mouseenter="hoverIndex = index"
          >
            <div class="agel-menu-item_content" @click="onSelect(item, $event)">
              <AgelIcon v-if="item.icon" :icon="item.icon" class="agel-context-menu-item_icon"></AgelIcon>
              <span class="agel-context-menu-item_title">{{ item.title }}</span>
              <span v-if="item.remark" class="agel-context-menu-item_remark">{{ item.remark }}</span>
              <AgelIcon v-if="hasSubMenu(item.children)" icon="ArrowRight" class="agel-context-menu_arrow"></AgelIcon>
            </div>
            <AgelContextMenu
              v-if="hasSubMenu(item.children)"
              :model-value="hoverIndex === index && menuRect.load"
              :menus="item.children"
              :transition="transition"
              :x="subMenusXy[index] ? subMenusXy[index][0] : 0"
              :y="subMenusXy[index] ? subMenusXy[index][1] : 0"
              @select="onSelect"
            />
          </div>
        </div>
      </Transition>
    </Teleport>
  `
    };

    // 导出组件
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = AgelContextMenu;
    } else if (typeof window !== 'undefined') {
        window.AgelContextMenu = AgelContextMenu;
    }
})(); // IIFE结束
