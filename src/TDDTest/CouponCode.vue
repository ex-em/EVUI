<template>
  <div>
    <br>
         쿠폰 코드 1. ABCD , 2 . ZZZZ
      <br>
        <input type="text" class="coupon-code" v-model="code" @input="validate">

        <p v-text="feedback"></p>
    </div>
</template>

<script>
    export default {
        data () {
            return {
                code: '',
                coupons: [
                    {
                        code: 'ABCD',
                        message: '10% Off!',
                        discount: 10
                    },
                    {
                        code: 'ZZZZ',
                        message: '공짜!',
                        discount: 100
                    }
                ],
                valid: false
            };
        },

        computed: {
            selectedCoupon () {

                return this.coupons.find(coupon => coupon.code == this.code);
            },

            message () {

              return 1; // this.selectedCoupon.message;
            },

            feedback () {
                if (this.valid) {
                    return `할인되는 금액: ${this.message}`;
                }

                return '쿠폰코드 입력 하시오.';
            }
        },

        methods: {
            validate () {

                this.valid = !! this.selectedCoupon;

                if (this.valid) {
                    this.$emit('applied', this.selectedCoupon.discount);
                }
            }
        }
    }
</script>
