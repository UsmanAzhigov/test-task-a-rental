const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Подключение к MongoDB
mongoose.connect('mongodb://localhost:27017/your-database-name', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Создание схемы и модели для Заказов
const orderSchema = new mongoose.Schema({
    status: { type: String, enum: ['новый', 'выполнен'], default: 'новый' },
    comment: { type: String },
});

const Order = mongoose.model('Order', orderSchema);

// Создание схемы и модели для Склада
const warehouseSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    comment: { type: String },
});

const WarehouseEntry = mongoose.model('WarehouseEntry', warehouseSchema);

// Обработка вебхука для изменения комментария
app.post('/webhook/update-comment', async (req, res) => {
    const orderId = req.body.orderId;
    const status = req.body.status;

    try {
        // Получаем информацию с внешней страницы
        const response = await axios.get('https://test.bpium.ru/api/webrequest/request');
        const commentValue = response.data.value;

        // Обновляем комментарий в записи каталога Заказы
        const order = await Order.findByIdAndUpdate(orderId, { $set: { comment: commentValue } }, { new: true });

        if (order) {
            res.status(200).send('Comment updated successfully');
        } else {
            res.status(404).send('Order not found');
        }
    } catch (error) {
        console.error('Error updating comment:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

// Обработка создания заказа и записи в Склад
app.post('/webhook/create-order', async (req, res) => {
    const orderComment = req.body.comment;

    try {
        // Создаем заказ
        const newOrder = await Order.create({ comment: orderComment });

        // Создаем запись в Складе
        const newWarehouseEntry = await WarehouseEntry.create({
            order: newOrder._id,
            comment: orderComment,
        });

        res.status(200).send('Order created successfully');
    } catch (error) {
        console.error('Error creating order:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
