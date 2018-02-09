import Vali from '@/TDDTest/Vali';

describe('#Validation Check', () => {
  it('이메일의 형식을 검증한다.', (done) => {
    const validate = new Vali();

    const result1 = validate.email('test@naver.com');
    const result2 = validate.email('test_1234@naver.com');
    const result3 = validate.email('!@test@naver.com');
    const result4 = validate.email('test#naver.com');
    const result5 = validate.email('test');
    const result6 = validate.email('naver.com');

    expect(result1).to.equal(true);
    expect(result2).to.equal(true);
    expect(result3).to.equal(false);
    expect(result4).to.equal(false);
    expect(result5).to.equal(false);
    expect(result6).to.equal(false);

    done();
  });
});

describe('#Validation Check', () => {
  it('이메일의 형식을 검증한다.2', (done) => {
    const validate = new Vali();

    // given
    const successTestCase = [
      'test@naver.com', 'test_1234@naver.com',
    ];
    const failTestCase = [
      '!@test@naver.com', 'test#naver.com', 'test', 'naver.com', '@#@!#@!@##.com',
    ];

    successTestCase.forEach((testCase) => {
      // when
      const result = validate.email(testCase);
      // then
      expect(result).to.equal(true);
    });
    failTestCase.forEach((testCase) => {
      // when
      const result = validate.email(testCase);
      // then
      expect(result).to.equal(false);
    });

    done();
  });

  it('expect - Array', () => {
    const arr = [1, 2, 5, 3, 4];

    expect(arr).to.have.lengthOf(5); // array length
    expect(arr).to.be.not.empty; // eslint-disable-line no-unused-expressions
    expect(arr).to.have.ordered.members([1, 2, 5, 3, 4]); // arr === members
    expect(arr).be.not.empty;
  });

  it('expect - String', () => {
    const str = 'Awesome!!';

    expect(str).to.be.a('String'); // str type
    expect(str).to.equal('Awesome!!'); // str === 'Awesome!!'
    expect(str).to.have.lengthOf(9, 'Why fail?'); // Error
  });

  it('expect - Object', () => {
    const obj = {
      assertion: ['assert', 'expect', 'should'],
      framework: 'mocha',
    };

    expect(obj).to.have.property('assertion').with.lengthOf(3); // assertion value length
    expect(obj).to.have.all.keys('framework', 'assertion'); // obj key === keys
  });

  it('should - Array', () => {
    const arr = [1, 2, 5, 3, 4];

    arr.should.have.lengthOf(5); // array length
    arr.should.be.not.empty;
    arr.should.have.ordered.members([1, 2, 5, 3, 4]); // arr === members
  });
});

