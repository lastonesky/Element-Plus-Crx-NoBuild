const AgelIcon = (function () {
  const { computed } = Vue;

  function getFileTypeByUrl(url) {
    const extension = url.split('.').pop()?.toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
    return imageExtensions.includes(extension) ? 'img' : 'other';
  }

  function isBase64Image(str) {
    return /^data:image\/(png|jpe?g|gif|svg\+xml);base64,/.test(str);
  }
    return {
      name: 'AgelIcon',
      props: {
        icon: [String, Object]
      },
      setup(props) {
        const imgSrc = computed(() => {
          if (typeof props.icon === 'string' && (getFileTypeByUrl(props.icon) === 'img' || isBase64Image(props.icon))) {
            return props.icon;
          }
          return null;
        });

        const elIconName = computed(() => {
          if (typeof props.icon === 'string' && window.ElementPlusIconsVue && window.ElementPlusIconsVue[props.icon]) {
            return window.ElementPlusIconsVue[props.icon];
          }
          return null;
        });

        const elIconComponent = computed(() => {
          if (typeof props.icon === 'object') {
            return props.icon;
          }
          return null;
        });

        return {
          imgSrc,
          elIconName,
          elIconComponent
        };
      },
      template: `
        <img v-if="imgSrc" :src="imgSrc" class="el-icon" v-bind="$attrs" />
        <el-icon v-else v-bind="$attrs">
          <component v-if="elIconName" :is="elIconName"></component>
          <component v-if="elIconComponent" :is="elIconComponent"></component>
        </el-icon>
      `
};
})()
