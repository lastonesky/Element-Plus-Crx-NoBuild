var AgelIcon = (function () {
  function getFileTypeByUrl(url) {
    const a = url.split(".").pop()
    const b = a ? a.split("?")[0] : ''
    const suffix = b.toLocaleLowerCase()
    if (["png", "jpg", "jpeg", "bmp", "gif", 'svg'].includes(suffix)) return 'img'
    if (["mp4", "ogg", "webm"].includes(suffix)) return 'video'
    if (["mp3", "wav", "ogg"].includes(suffix)) return 'audio'
  };
    return {
        data() {
          return {
          }
        },
        computed:{
          isImg () {
            return typeof this.icon == 'string' && getFileTypeByUrl(this.icon) == 'img'
          }
        },
        props:['icon'],
        template: /*html*/`<img v-if="isImg" :src="icon" class="el-icon" v-bind="$attrs" />
  <el-icon v-else v-bind="$attrs">
    <component :is="icon"></component>
  </el-icon>`
    }
})()