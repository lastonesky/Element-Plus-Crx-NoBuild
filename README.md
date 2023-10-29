# Element-Plus-Crx ContextMenu 的非构筑版本

## 这是干什么用的

因为 Element-Plus-Crx 只提供了构筑版本，不方便网页直接使用，所以转换了 ContextMenu 组件到非构筑的方式。目前只迁移了一个ContextMenu，有兴趣的人可以迁移更多的组件。

## 使用方式

```html
<html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="//unpkg.com/element-plus@2.3.8/dist/index.css" />
        <link rel="stylesheet" href="/css/agel-contextmenu" />
        <script type="text/javascript" src="//unpkg.com/vue@3.2.36/dist/vue.global.prod.js"></script>
        <script src="//unpkg.com/element-plus@2.3.8/dist/index.full.min.js"></script>
        <script src="//unpkg.com/element-plus@2.3.8/dist/locale/en.min.js"></script>
        <script src="//unpkg.com/@@element-plus/icons-vue@@2.1.0/dist/index.iife.min.js"></script>
        <script src="/component/AgelIcon.js"></script>
        <script src="/component/AgelContextMenu.js"></script>
    </head>
    <body>
    <div id="app">
    <div class="demo" style="height: 150px;" @contextmenu.prevent="onContextmenu($event)">
        此处使用右键触发菜单
    </div>
    <agel-context-menu v-model="contextMenu.show" :x="contextMenu.x" :y="contextMenu.y" :menus="contextMenu.data" @select="contextMenu.onSelect"></agel-context-menu>
    </div>
<script>
    const app = Vue.createApp({
        data () {
            return {
                contextMenu: Vue.reactive({
                    show: false,
                    x: 0,
                    y: 0,
                    data: [
                        { title: '1-1 菜单', icon: 'Menu', },
                        { title: '1-2 菜单', icon: 'Menu', divided: true, },
                        {
                            title: '1-3 菜单',
                            icon: '',
                            children: [
                                { title: '1-3-1 菜单', remark: 'Ctrl+A', },
                                { title: '1-3-2 菜单', disabled: true, },
                                { title: '1-3-3 菜单', className: 'custom-red-menu-item' },
                            ]
                        },
                    ],
                    onSelect: (item) => {
                        console.log(item)
                        this.$message({message:'选中了' + item.title,type:'success'});
                    },
                })
            }
        },
        methods:{
            onContextmenu(e) {
                this.contextMenu.show = true
                this.contextMenu.x = e.clientX
                this.contextMenu.y = e.clientY
                e.preventDefault()
            },
        }
    })
    app.use(ElementPlus, {
            locale: ElementPlusLocaleEn,
        })
    app.component('Menu', ElementPlusIconsVue['Menu']);
    app.component('ArrowDown', ElementPlusIconsVue['ArrowDown']);
    app.component('ArrowRight', ElementPlusIconsVue['ArrowRight']);
    app.component('AgelContextMenu', AgelContextMenu)
</script>
</body>
```