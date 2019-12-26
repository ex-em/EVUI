import EvButton from '@/components/button/button';
import { shallowMount } from '@vue/test-utils';

describe('EvButton', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(EvButton);
  });

  it('is called', () => {
    // expect(wrapper.name()).toBe('EvButton');
    expect(wrapper.isVueInstance()).toBeTruthy();
  });

  it('render correctly', () => {
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('should be warning', () => {
    wrapper = shallowMount(EvButton, {
      propsData: {
        type: 'warning',
      },
    });
    expect(wrapper.classes()).toContain('ev-btn-warning');
  });

  it('should be large', () => {
    wrapper = shallowMount(EvButton, {
      propsData: {
        size: 'large',
      },
    });
    expect(wrapper.classes()).toContain('ev-btn-size-large');
  });

  it('should be radius', () => {
    wrapper = shallowMount(EvButton, {
      propsData: {
        shape: 'radius',
      },
    });
    expect(wrapper.classes()).toContain('ev-btn-radius');
  });

  it('should be disable', () => {
    const click = jest.fn();
    wrapper = shallowMount(EvButton, {
      propsData: {
        disabled: true,
      },
      listeners: {
        click,
      },
    });
    wrapper.find('.ev-btn').trigger('click');
    expect(click).toHaveBeenCalledTimes(0);
  });

  it('primary + small + radius', () => {
    wrapper = shallowMount(EvButton, {
      propsData: {
        type: 'primary',
        size: 'small',
        shape: 'radius',
      },
    });
    expect(wrapper.classes()).toEqual(expect.arrayContaining([
      'ev-btn-primary',
      'ev-btn-size-small',
      'ev-btn-radius',
    ]));
  });

  it('success + large + circle', () => {
    wrapper = shallowMount(EvButton, {
      propsData: {
        type: 'success',
        size: 'large',
        shape: 'circle',
      },
    });
    expect(wrapper.classes()).toEqual(expect.arrayContaining([
      'ev-btn-success',
      'ev-btn-size-large',
      'ev-btn-circle',
    ]));
  });

  it('emit a click event', () => {
    const click = jest.fn();
    wrapper = shallowMount(EvButton, {
      listeners: {
        click,
      },
    });
    wrapper.vm.onClick();
    expect(click).toHaveBeenCalledTimes(1);
  });
});
