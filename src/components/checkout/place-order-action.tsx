import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import isEmpty from 'lodash/isEmpty';
import classNames from 'classnames';
import { useCreateOrder, useOrderStatuses } from '@/framework/order';
import ValidationError from '@/components/ui/validation-error';
import Button from '@/components/ui/button';
import { formatOrderedProduct } from '@/lib/format-ordered-product';
import { useCart } from '@/store/quick-cart/cart.context';
import { checkoutAtom, discountAtom, payableAmountAtom, walletAtom } from '@/store/checkout';
import {
  calculatePaidTotal,
  calculateTotal,
} from '@/store/quick-cart/cart.utils';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useUser } from '@/framework/user';

export const PlaceOrderAction: React.FC<{ className?: string }> = (props) => {
  const { t } = useTranslation('common');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { createOrder, isLoading } = useCreateOrder();
  const { locale } : any = useRouter();
  const { items } = useCart();
  const { me }: any = useUser();
  const [payableAmount] = useAtom(payableAmountAtom);

  const { orderStatuses } = useOrderStatuses({
    limit: 1,
    language: locale
  });

  const [
    {
      billing_address,
      shipping_address,
      delivery_time,
      coupon,
      verified_response,
      customer_contact,
      payment_gateway,
      token,
    },
  ] = useAtom(checkoutAtom);
  const [discount] = useAtom(discountAtom);
  const [use_wallet_points] = useAtom(walletAtom);

  useEffect(() => {
    setErrorMessage(null);
  }, [payment_gateway]);

  const available_items = items?.filter(
    (item) => !verified_response?.unavailable_products?.includes(item.id)
  );

  const subtotal = calculateTotal(available_items);
  const total = calculatePaidTotal(
    {
      totalAmount: subtotal,
      tax: verified_response?.total_tax!,
      shipping_charge: verified_response?.shipping_charge!,
    },
    Number(discount)
  );

  const hiba_discount_name = `HIBA-${me.plan.name}`;
  const hiba_discount_amount = subtotal * Number(me.plan.physicalDiscount) / 100 
  const hiba_discounted_total = subtotal - (subtotal * Number(me.plan.physicalDiscount) / 100)

  const handlePlaceOrder = () => {
    if (!customer_contact) {
      setErrorMessage('Contact Number Is Required');
      return;
    }
    if (!use_wallet_points && !payment_gateway) {
      setErrorMessage('Gateway Is Required');
      return;
    }
    // if (!use_wallet_points && payment_gateway === 'STRIPE' && !token) {
    //   setErrorMessage('Please Pay First');
    //   return;
    // }
    const total_to_pay = me.plan ? hiba_discounted_total : total;
    const total_with_wallet = payableAmount == 0 && !use_wallet_points ? total_to_pay : payableAmount;
    // console.log('>>>><<<<<', total_with_wallet);
    
    let input = {
      //@ts-ignore
      products: available_items?.map((item) => formatOrderedProduct(item)),
      status: orderStatuses[0]?.id ?? '1',
      amount: subtotal,
      coupon_id: me.plan ? hiba_discount_name : coupon?.code,
      discount: me.plan ? hiba_discount_amount : discount ?? 0,
      paid_total: total_with_wallet,
      sales_tax: verified_response?.total_tax,
      delivery_fee: verified_response?.shipping_charge,
      total: me.plan ? hiba_discounted_total : total,
      delivery_time: delivery_time?.title,
      customer_contact,
      payment_gateway,
      use_wallet_points,
      wallet_points_to_use: use_wallet_points ? total_to_pay - payableAmount : 0,
      billing_address: {
        ...(billing_address?.address && billing_address.address),
      },
      shipping_address: {
        ...(shipping_address?.address && shipping_address.address),
      },
    };
    // if (payment_gateway === 'STRIPE') {
    //   //@ts-ignore
    //   input.token = token;
    // }

    delete input.billing_address.__typename;
    delete input.shipping_address.__typename;
    //@ts-ignore
    createOrder(input);
  };
  const isDigitalCheckout = available_items.find((item) =>
    Boolean(item.is_digital)
  );

  const formatRequiredFields = isDigitalCheckout
    ? [customer_contact, payment_gateway, available_items]
    : [
        customer_contact,
        payment_gateway,
        // billing_address,
        // shipping_address,
        // delivery_time,
        available_items,
      ];
  const isAllRequiredFieldSelected = formatRequiredFields.every(
    (item) => !isEmpty(item)
  );
  return (
    <>
      <Button
        loading={isLoading}
        className={classNames('mt-5 w-full', props.className)}
        onClick={handlePlaceOrder}
        disabled={!isAllRequiredFieldSelected}
        {...props}
      />
      {errorMessage && (
        <div className="mt-3">
          <ValidationError message={errorMessage} />
        </div>
      )}
      {!isAllRequiredFieldSelected && (
        <div className="mt-3">
          <ValidationError message={t('text-place-order-helper-text')} />
        </div>
      )}
    </>
  );
};
