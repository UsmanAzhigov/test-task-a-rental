<template>
  <div class="q-pa-md">
    <q-input v-model="orderComment" label="Комментарий к заказу" />
    <q-btn @click="createOrder">Создать заказ</q-btn>
  </div>
</template>

<script>
export default {
  data() {
    return {
      orderComment: ''
    };
  },
  methods: {
    async createOrder() {
      try {
        // Отправка запроса к API для создания заказа
        await this.$axios.post('/webhook/create-order', { comment: this.orderComment });
        alert('Заказ создан успешно!');
      } catch (error) {
        console.error('Error creating order:', error.message);
        alert('Ошибка при создании заказа');
      }
    }
  }
};
</script>
