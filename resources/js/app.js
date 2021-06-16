import axios from 'axios';
import Noty from 'noty';
import { initAdmin } from './admin';
import moment from 'moment';

let addToCart = document.querySelectorAll('.add-to-cart');
let removeFromCart = document.querySelectorAll('.remove-from-cart');
let cartCounter = document.querySelector('#cartCounter');
let cartAmount = document.querySelector('.amount');
const alertMsg = document.querySelector('#success-alert');
const guestsNumber = document.querySelector('#guestsNumber');
const totalPlatePrice = document.querySelector('#totalPlatePrice');
const subTotalPrice = document.querySelector('#subTotalPrice');
const guestsNumberHolder = document.querySelector('#guestsNumberHolder');


// add to cart, funcionality
function updateCart(item) {
  axios.post('/update-cart', item)
  .then(res => {
    cartCounter.innerText = res.data.totalQty;
    new Noty({
      type: 'success',
      timeout: 1000,
      progressBar: false,
      text: 'Added To Cart, <a href="/cart" class="text-md font-bold">Checkout Now</a>',
      layout: 'topRight'
    }).show();
  })
  .catch( err => {
    new Noty({
      type: 'error',
      timeout: 1000,
      progressBar: false,
      text: 'Whoops! Item Could Not Be Added.',
      layout: 'topRight'
    }).show();
  })
}

// add to cart event handler
addToCart.forEach((btn) => {
  btn.addEventListener('click', (e)=>{
    let item = JSON.parse(btn.dataset.item);
    updateCart(item);
  });
});


// remove from cart, funcionality
function removeCartItem(item, btn) {
  axios.post('/remove-cart-item', item)
  .then(res => {
    if (res.data.refreshPage) {
      location.reload();
    } else {
      cartCounter.innerText = res.data.totalQty;
      cartAmount.innerText = `₹${res.data.totalPrice}`;
      new Noty({
        type: 'success',
        timeout: 1000,
        progressBar: false,
        text: 'Removed From Cart',
        layout: 'topRight'
      }).show();
      btn.parentElement.parentElement.remove();
      //update totalPlatePrice based on subTotalPrice
      if (totalPlatePrice) {
          totalPlatePrice.innerText = `₹${ String( ( guestsNumber.value ? parseFloat(guestsNumber.value) : 1.0) * parseFloat(subTotalPrice.innerText.substring(1,4))) }`;
      }

    }


  })
  .catch( err => {
    new Noty({
      type: 'error',
      timeout: 1000,
      progressBar: false,
      text: 'Whoops! Item Could Not Be Deleted.',
      layout: 'topRight'
    }).show();
  })
}

// remove from cart event handler
removeFromCart.forEach((btn) => {
  btn.addEventListener('click', (e)=>{
    let item = JSON.parse(btn.dataset.item);
    removeCartItem(item, btn);
  });
});


//totalPlatePrice updater
if (window.location.pathname.includes('cart') && guestsNumber) {

  guestsNumber.addEventListener('change', (e) => {
      totalPlatePrice.innerText = `₹${String(parseFloat(e.target.value) * parseFloat(subTotalPrice.innerText.substring(1,4)))}`;
      guestsNumberHolder.innerText = e.target.value;
    });

}


//Noty alert message remover
if(alertMsg) {
    setTimeout(() => {
        alertMsg.remove()
    }, 3000)
}


// Change order status
let statuses = document.querySelectorAll('.status_line');
let hiddenInput = document.querySelector('#hiddenInput');
let order = hiddenInput ? hiddenInput.value : null;
order = JSON.parse(order);
let time = document.createElement('small');

function updateStatus(order) {
    statuses.forEach((status) => {
        status.classList.remove('step-completed');
        status.classList.remove('current');
    });
    let stepCompleted = true;
    statuses.forEach((status) => {
       let dataProp = status.dataset.status;
       if(stepCompleted) {
            status.classList.add('step-completed');
       }
       if(dataProp === order.status) {
            stepCompleted = false;
            time.innerText = moment(order.updatedAt).format('@ Do MMMM YYYY - hh:mm A');
            status.appendChild(time);
           if(status.nextElementSibling) {
            status.nextElementSibling.classList.add('current');
           }
       }
    });

}

updateStatus(order);

let socket = io();

if(order) {
    socket.emit('join', `order_${order._id}`);
}

let adminAreaPath = window.location.pathname;
if(adminAreaPath.includes('admin') && document.querySelector('#orderCardBody')) {
    initAdmin(socket);
    socket.emit('join', 'adminRoom');
}


socket.on('orderUpdated', (data) => {
    const updatedOrder = { ...order }
    updatedOrder.updatedAt = moment().format();
    updatedOrder.status = data.status;
    updateStatus(updatedOrder);
    new Noty({
        type: 'success',
        timeout: 1000,
        text: 'Order updated',
        progressBar: false,
    }).show();
});
