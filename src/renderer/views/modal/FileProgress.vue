<template>
  <div class="card file-progress" v-show="showModal" @keyup.esc="close" @keyup.enter="submit">
    <div class="card-header" @dblclick="foldProgress">
      <span class="card-header-title">正在进行</span>
      <span class="card-header-icon" @click="foldProgress">
        <Icon :name="isFold ? '#icon-angle-up' : '#icon-angle-down'" />
      </span>
      <span class="card-header-icon" @click="close">
        <Icon name="icon-x" />
      </span>
    </div>
    <div v-show="!isFold" style="max-height: 300px;overflow: auto;">
      <div class="card-block" v-for="data in taskList" :key="data.id">
        <div class="card-block-title">
          {{data.filename}}
          <br>
          <p style="color:#a5a5a5;">
            {{data.done | digiUnit}}/{{data.size | digiUnit}}&nbsp;&nbsp;{{data.status | uploadStatus}}
          </p>
        </div>
        <div class="card-block-icon" v-show="data.status === '0' || data.status === '1'">
          <progress-bar :progress='data.percentage' class="progress-bar"></progress-bar>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { reverse } from 'ramda'

import ProgressBar from '@/components/ProgressBar'
import Icon from '@/components/Icon'
import { digiUnit, uploadStatus } from '@/api/tool'

export default {
  name: 'FileProgress',
  components: {
    ProgressBar,
    Icon,
  },
  data() {
    return {
      isFold: false,
      folderName: '',
    }
  },
  computed: {
    ...mapState(['task']),
    taskList() {
      return reverse(this.task.taskList)
    },
    showModal() {
      return this.task.showModal
    },
  },
  methods: {
    close() {
      this.$store.commit('HIDE_TASK_MODAL')
    },
    foldProgress() {
      this.isFold = !this.isFold
    },
    cancelTask(data) {},
    retryTask(data) {},
  },
  filters: {
    digiUnit,
    uploadStatus,
  },
}
</script>
