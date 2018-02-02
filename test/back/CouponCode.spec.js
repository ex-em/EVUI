import { mount } from 'vue-test-utils';
import CouponCode from '../../../src/TDDTest/CouponCode';

describe('CouponCode', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(CouponCode);

    wrapper.setData({
      coupons: [
        {
          code: '50OFF',
          message: '50% Off!',
          discount: 50,
        },
      ],
    });
  });

  function enterCouponCode(code) {
    const couponCode = wrapper.find('input.coupon-code');

    couponCode.element.value = code;
    // couponCode.trigger('input');
  }


  it('쿠폰코드를 입력 받는다.', () => {
    expect(wrapper.contains('input.coupon-code')).to.be.equal(true);
  });


  it('쿠폰코드를 입력 받는다 (정상).', () => {
    enterCouponCode('50OFF');

    expect(wrapper.find('p').html()).to.include('할인되는 금액: ');
  });

  it('일치하지 않는 쿠폰코드 입력', () => {
    enterCouponCode('NOTREAL');

    expect(wrapper.find('p').html()).include('쿠폰코드 입력 하시오');
  });

  it('쿠폰코드 이벤트 체크', () => {
    enterCouponCode('50OFF');

    // expect(wrapper.emitted().applied).to.equal(true);
    // expect(wrapper.emitted().applied[0]).to.deep.equal([50]);
    expect(wrapper.emitted().applied[0]).to.includes(50);
  });
});

