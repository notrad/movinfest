import { loadStripe } from '@stripe/stripe-js';
import { placeOrder } from './apiService';
import { CardWidget } from './CardWidget';

export async function initStripe() {
  var stripe = await loadStripe('pk_test_51JFGPGSHPTXjacKD2ufAv9BQudBNpHOD3wz5PaIxcBXVhdnO04PHDIYhPTCguq3XhWdOAsl66oyNLAHSBdvgobYW00SgVnpzIK');
  
  let card = null;

  const paymentType = document.querySelector('#paymentType');
  if (paymentType) {
    paymentType.addEventListener('change', (e) => {
      if (e.target.value === 'card') {
        card = new CardWidget(stripe);
        card.mount();
      } else {
        card.destroy();
      }
    });
  }

  const paymentForm = document.querySelector('#payment-form');
  if (paymentForm) {
    paymentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      let formData = new FormData(paymentForm);
      let formObject = {};

      for (var [key, value] of formData.entries()) {
          formObject[key] = value;
      }

      if (!card) {
        placeOrder(formObject);
        return;
      }

      const token = await card.createToken();
      formObject.stripeToken = token.id;
      placeOrder(formObject);

    });
  }
}
