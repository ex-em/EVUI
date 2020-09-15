import { shallowMount } from '@vue/test-utils';
import Checkbox from '@/components/checkbox/Checkbox';

describe('Radio.vue', () => {
  it('renders props.msg when passed', () => {
    const msg = 'new message';
    const wrapper = shallowMount(Checkbox, {
      props: { msg },
    });
    expect(wrapper.text()).toMatch(msg);
  });
});
