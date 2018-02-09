import { mount } from 'vue-test-utils';
import Reminders from '../../../../src/TDDTest/Reminders';

describe('Reminders', () => {
  let wrapper;

  beforeEach(() => {
    // vue 인스턴트 활성화
    wrapper = mount(Reminders);
  });

  // 메모추가
  function addReminder(body) {

    // VUE에서 클래스를 찾는다.
    const newReminder = wrapper.find('.new-reminder');

    newReminder.element.value = body;
    newReminder.trigger('input');

    wrapper.find('button').trigger('click');
  }
  // 저장된 메모 리스트
  function remindersList() {
    return wrapper.find('ul').text();
  }

  it('초기값 ul 테크 생성 여부 확인', () => {
    expect(wrapper.contains('ul')).to.equal(false);
  });

  it('메모 하나 추가', () => {
    addReminder('메모1');

    expect(remindersList()).to.include('메모1');
  });

  it('메모 삭제하고 메모 리스트 확인', () => {
    addReminder('메모1');
    addReminder('메모2');
    addReminder('메모3');
    addReminder('메모4');


    const deleteButton = wrapper.find('ul > li:first-child .remove'); // 첫번째 메모 삭제

    deleteButton.trigger('click');

    expect(remindersList()).not.to.include('메모1');
    expect(remindersList()).to.include('메모2');
  });

  after(() => {
    // TDD 진행 전에 vue 객체를 인터스화 시킨다.
    wrapper.destroy();
  });
});

