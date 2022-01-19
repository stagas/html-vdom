import { VList } from '../src/v'

const r1 = '1'
const r2 = '2'
const r3 = '3'
const r4 = '4'

describe('VList', () => {
  describe('insertBefore', () => {
    it('moves between same list', () => {
      const a = new VList(r1, r2, r3, r4)
      expect(a).toMatchSnapshot()
      a.insertBefore(r3, r2)
      expect(a).toMatchSnapshot()
      a.insertBefore(r3, r2)
      expect(a).toMatchSnapshot()
      a.insertBefore(r2, r3)
      expect(a).toMatchSnapshot()
      a.insertBefore(r3, r1)
      expect(a).toMatchSnapshot()
      a.insertBefore(r3, r1)
      expect(a).toMatchSnapshot()
      a.insertBefore(r1, r4)
      expect(a).toMatchSnapshot()
      a.insertBefore(r1, r4)
      expect(a).toMatchSnapshot()
      a.insertBefore(r3, r4)
      a.insertBefore(r2, r3)
      a.insertBefore(r1, r2)
      expect(a).toMatchSnapshot()
    })
  })

  // describe('replaceChild', () => {
  //   it('replaces between same list', () => {
  //     const a = new VList(r1, r2, r3, r4)
  //     expect(a).toMatchSnapshot()
  //     a.replaceChild(r3, r2)
  //     expect(a).toMatchSnapshot()
  //   })
  // })
})
