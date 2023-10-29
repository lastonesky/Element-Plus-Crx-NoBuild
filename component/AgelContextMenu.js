var AgelContextMenu = (function(){
    const useZIndex = ElementPlus.useZIndex;
    const { nextZIndex } = useZIndex();
        
    return {
        data () {
            return {
              submenuXY: Vue.ref(-1000),
              hoverIndex: Vue.ref(-1),
              zIndex: Vue.ref(nextZIndex())
            }
        },
        components:{
          AgelIcon,
          AgelContextMenu
        },
        computed:{
            isSubMenu () {return this.x === this.submenuXY && this.y === this.submenuXY},
            menuStyle () {
                const zindexStyle = {
                  zIndex: this.zIndex.value
                }
                const positionStyle = {
                  top: this.y + 'px',
                  left: this.x + 'px',
                  position: 'fixed'
                }
                return this.isSubMenu ? zindexStyle : { ...zindexStyle, ...positionStyle }
            },
            menuData () {
                return this.filterMenu(this.menus)
            },
            hasIcon () {
                return this.menus.some((v) => v.icon != undefined)
            }
        },
        emits:['update:modelValue','select'],
        props:{
            modelValue: Boolean,
            x: Number,
            y: Number,
            menus: {type: Array, default: []},
            transition: { type: String, default:'el-zoom-in-top'}
        },
        methods:{
            filterMenu (menus = []) {
                return menus.filter((v) => v.hidden !== true)
            },
            hasSubMenu (menus = []) {
                return this.filterMenu(menus).length > 0
            },
            hideMenu () {
                this.$emit('update:modelValue', false)
            },
            onSelect(menuItem, e){
                if (this.hasSubMenu(menuItem.children)) {
                    e && e.stopPropagation()
                  } else {
                    this.$emit('select', menuItem)
                  }
            }
        },
        mounted () {
            document.addEventListener('click', this.hideMenu)
        },
        unmounted () {
            document.removeEventListener('click', this.hideMenu)
        },
        template: /*html*/`
<teleport v-if="menuData.length > 0" to="body" :disabled="isSubMenu">
    <transition :name="transition">
      <div class="agel-context-menu" v-show="modelValue" :style="menuStyle" @mouseleave="hoverIndex = -1">
        <div
          v-for="(item, index) in menuData"
          :key="index"
          :class="[
            'agel-context-menu-item',
            item.className,
            { __divided: item.divided, __disabled: item.disabled, __hasicon: hasIcon }
          ]"
          @mouseenter="hoverIndex = index"
        >
          <div class="agel-menu-item_content" @click="onSelect(item, $event)">
            <agel-icon v-if="item.icon" :icon="item.icon" class="agel-context-menu-item_icon"></agel-icon>
            <span class="agel-context-menu-item_title">{{ item.title }}</span>
            <span class="agel-context-menu-item_remark">{{ item.remark }}</span>
            <agel-icon v-if="hasSubMenu(item.children)" icon="ArrowRight" class="agel-context-menu_arrow"></agel-icon>
          </div>
          <agel-context-menu
            v-if="hasSubMenu(item.children)"
            :model-value="hoverIndex === index"
            :menus="item.children"
            :transition="transition"
            :x="submenuXY"
            :y="submenuXY"
            @select="onSelect"
          ></agel-context-menu>
        </div>
      </div>
    </transition>
  </teleport>
        `
    }
})()