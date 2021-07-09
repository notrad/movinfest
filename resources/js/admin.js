import axios from 'axios';
import moment from 'moment';
import Noty from 'noty';

export function initAdmin(socket) {
  const orderCardBody = document.querySelector('#orderCardBody');
    let orders = [];
    let markup;

    axios.get('/admin/orders', {
        headers: {
            "X-Requested-With": "XMLHttpRequest"
        }
    }).then(res => {
        orders = res.data;
        markup = generateOrderMarkup(orders);
        orderCardBody.innerHTML = markup;
    }).catch(err => {
        console.log(err);
    });



    function generateOrderMarkup(orders) {
      if (Object.keys(orders).length === 0) {
        return `<div class="rounded shadow-md px-4 py-2 font-bold capitalize">
            <p class="p-4"><span>No orders yet!</span></p>
        </div>`;
      } else {
        return orders.map(order => {
            return `
            <div class="rounded shadow-md bg-white py-3 mb-3 sm:py-4 sm:px-8 md:ml-2 flex-1">
              <div class="px-4 pb-2 font-bold text-lg border-b">
                  <a class="link bg-gray-100 py-1 rounded-full px-4 text-green-600 font-bold" href="/admin/orders/${ order._id }"><span >Order Number: </span>${ order._id.substring(19,24) } </a>
              </div>
              <div class="px-4 my-1 font-bold">
                  Customer: ${ order.customerId.name }
              </div>
              <div class="px-4 mb-1 font-bold">
                  Phone: +91 ${ order.phone }
              </div>
              <div class="px-4 mt-1 mb-2 font-bold">
                  Order Status:
                  <div class="inline-block relative w-64">
                      <form action="/admin/order/status" method="POST">
                          <input type="hidden" name="orderId" value="${ order._id }">
                          <select name="status" onchange="this.form.submit()"
                              class="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                              <option value="order_placed"
                                  ${ order.status === 'order_placed' ? 'selected' : '' }>
                                  Placed</option>
                              <option value="confirmed" ${ order.status === 'confirmed' ? 'selected' : '' }>
                                  Confirmed</option>
                              <option value="prepared" ${ order.status === 'prepared' ? 'selected' : '' }>
                                  Prepared</option>
                              <option value="delivered" ${ order.status === 'delivered' ? 'selected' : '' }>
                                  Delivered
                              </option>
                              <option value="completed" ${ order.status === 'completed' ? 'selected' : '' }>
                                  Completed
                              </option>
                          </select>
                      </form>
                      <div
                          class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                          <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20">
                              <path
                                  d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                          </svg>
                      </div>
                  </div>
              </div>
              <div class="px-4 mb-1 font-bold">
                  Received On: ${ moment(order.createdAt).format('Do MMMM YYYY, hh:mm A') }
              </div>
              <div class="px-4 mb-1 font-bold">
                  Payment Status: ${ order.paymentStatus ? 'paid' : 'Not Paid (Cash On Delivery)' }
              </div>
            </div>
                `
      }).join('');
    }
    }

    socket.on('orderPlaced', (order) => {
        new Noty({
            type: 'success',
            timeout: 1000,
            text: 'New order Received!',
            progressBar: false,
        }).show();
        orders.unshift(order);
        orderCardBody.innerHTML = '';
        orderCardBody.innerHTML = generateOrderMarkup(orders);
    });
}
