import { diff } from '../diff'
import { VList } from '../v'

const eq = (a: unknown, b: unknown) => a === b

// lists
let parent: VList<number>
let prev: number[]
let next: number[]

// spies
let append: jest.SpyInstance
let remove: jest.SpyInstance
let insert: jest.SpyInstance
let replace: jest.SpyInstance

const run = () => {
  parent = new VList(...prev)
  append = jest.spyOn(parent, 'appendChild')
  remove = jest.spyOn(parent, 'removeChild')
  insert = jest.spyOn(parent, 'insertBefore')
  replace = jest.spyOn(parent, 'replaceChild')
  diff(eq, parent, next, [...prev])
}

describe('diff', () => {
  describe('append', () => {
    it('appends 1', () => {
      prev = [1, 2, 3]
      next = [1, 2, 3, 4]
      run()
      expect(parent).toMatchSnapshot()
      expect(insert).toHaveBeenCalledTimes(1)
      expect(remove).toHaveBeenCalledTimes(0)
      expect(append).toHaveBeenCalledTimes(1)
      expect(replace).toHaveBeenCalledTimes(0)
    })

    it('appends 2', () => {
      prev = [1, 2, 3]
      next = [1, 2, 3, 4, 5]
      run()
      expect(parent).toMatchSnapshot()
      expect(insert).toHaveBeenCalledTimes(2)
      expect(remove).toHaveBeenCalledTimes(0)
      expect(append).toHaveBeenCalledTimes(2)
      expect(replace).toHaveBeenCalledTimes(0)
    })
  })

  describe('prepend', () => {
    it('prepends 1', () => {
      prev = [1, 2, 3]
      next = [4, 1, 2, 3]
      run()
      expect(parent).toMatchSnapshot()
      expect(insert).toHaveBeenCalledTimes(1)
      expect(remove).toHaveBeenCalledTimes(0)
      expect(append).toHaveBeenCalledTimes(0)
      expect(replace).toHaveBeenCalledTimes(0)
    })

    it('prepends 2', () => {
      prev = [1, 2, 3]
      next = [4, 5, 1, 2, 3]
      run()
      expect(parent).toMatchSnapshot()
      expect(insert).toHaveBeenCalledTimes(2)
      expect(remove).toHaveBeenCalledTimes(0)
      expect(append).toHaveBeenCalledTimes(0)
      expect(replace).toHaveBeenCalledTimes(0)
    })
  })

  describe('move', () => {
    it('moves 1', () => {
      prev = [1, 2, 3, 4]
      next = [1, 3, 2, 4]
      run()
      expect(parent).toMatchSnapshot()
      expect(insert).toHaveBeenCalledTimes(1)
      expect(remove).toHaveBeenCalledTimes(0)
      expect(append).toHaveBeenCalledTimes(0)
      expect(replace).toHaveBeenCalledTimes(0)
    })

    it('moves 2', () => {
      prev = [1, 2, 3, 4]
      next = [1, 3, 4, 2]
      run()
      expect(parent).toMatchSnapshot()
      expect(insert).toHaveBeenCalledTimes(2)
      expect(remove).toHaveBeenCalledTimes(0)
      expect(append).toHaveBeenCalledTimes(0)
      expect(replace).toHaveBeenCalledTimes(0)
    })

    it('moves all', () => {
      prev = [1, 2, 3, 4, 5, 6, 7, 8]
      // 1,2 and 4 are left in a row so we expect 5 inserts out of 8
      next = [3, 6, 5, 1, 2, 7, 8, 4]
      run()
      expect(parent).toMatchSnapshot()
      expect(insert).toHaveBeenCalledTimes(5)
      expect(remove).toHaveBeenCalledTimes(0)
      expect(append).toHaveBeenCalledTimes(0)
      expect(replace).toHaveBeenCalledTimes(0)
    })
  })

  describe('replace', () => {
    it('replaces 1', () => {
      prev = [1, 2, 3]
      next = [1, 4, 3]
      run()
      expect(parent).toMatchSnapshot()
      expect(insert).toHaveBeenCalledTimes(0)
      expect(remove).toHaveBeenCalledTimes(0)
      expect(append).toHaveBeenCalledTimes(0)
      expect(replace).toHaveBeenCalledTimes(1)
    })

    it('replaces 2', () => {
      prev = [1, 2, 3, 4, 5]
      next = [1, 6, 3, 7, 5]
      run()
      expect(parent).toMatchSnapshot()
      expect(insert).toHaveBeenCalledTimes(0)
      expect(remove).toHaveBeenCalledTimes(0)
      expect(append).toHaveBeenCalledTimes(0)
      expect(replace).toHaveBeenCalledTimes(2)
    })

    it('replaces all', () => {
      prev = [1, 2, 3]
      next = [4, 5, 6]
      run()
      expect(parent).toMatchSnapshot()
      expect(insert).toHaveBeenCalledTimes(0)
      expect(remove).toHaveBeenCalledTimes(0)
      expect(append).toHaveBeenCalledTimes(0)
      expect(replace).toHaveBeenCalledTimes(3)
    })
  })

  describe('remove', () => {
    it('removes tail 1', () => {
      prev = [1, 2, 3]
      next = [1, 2]
      run()
      expect(parent).toMatchSnapshot()
      expect(insert).toHaveBeenCalledTimes(0)
      expect(remove).toHaveBeenCalledTimes(1)
      expect(append).toHaveBeenCalledTimes(0)
      expect(replace).toHaveBeenCalledTimes(0)
    })

    it('removes tail 2', () => {
      prev = [1, 2, 3, 4]
      next = [1, 2]
      run()
      expect(parent).toMatchSnapshot()
      expect(insert).toHaveBeenCalledTimes(0)
      expect(remove).toHaveBeenCalledTimes(2)
      expect(append).toHaveBeenCalledTimes(0)
      expect(replace).toHaveBeenCalledTimes(0)
    })

    it('removes head 1', () => {
      prev = [1, 2, 3]
      next = [2, 3]
      run()
      expect(parent).toMatchSnapshot()
      expect(insert).toHaveBeenCalledTimes(2)
      expect(remove).toHaveBeenCalledTimes(1)
      expect(append).toHaveBeenCalledTimes(0)
      expect(replace).toHaveBeenCalledTimes(0)
    })

    it('removes head 2', () => {
      prev = [1, 2, 3, 4]
      next = [3, 4]
      run()
      expect(parent).toMatchSnapshot()
      expect(insert).toHaveBeenCalledTimes(2)
      expect(remove).toHaveBeenCalledTimes(2)
      expect(append).toHaveBeenCalledTimes(0)
      expect(replace).toHaveBeenCalledTimes(0)
    })

    it('removes middle 1', () => {
      prev = [1, 2, 3, 4]
      next = [1, 2, 4]
      run()
      expect(parent).toMatchSnapshot()
      expect(insert).toHaveBeenCalledTimes(1)
      expect(remove).toHaveBeenCalledTimes(1)
      expect(append).toHaveBeenCalledTimes(0)
      expect(replace).toHaveBeenCalledTimes(0)
    })

    it('removes middle 2', () => {
      prev = [1, 2, 3, 4]
      next = [1, 4]
      run()
      expect(parent).toMatchSnapshot()
      expect(insert).toHaveBeenCalledTimes(1)
      expect(remove).toHaveBeenCalledTimes(2)
      expect(append).toHaveBeenCalledTimes(0)
      expect(replace).toHaveBeenCalledTimes(0)
    })
  })

  describe('problematic cases', () => {
    it('replace with tail', () => {
      prev = [1, 2, 3]
      next = [1, 4, 5, 6, 3]
      run()
      expect(parent).toMatchSnapshot()
      expect(insert).toHaveBeenCalledTimes(2)
      expect(remove).toHaveBeenCalledTimes(0)
      expect(append).toHaveBeenCalledTimes(0)
      expect(replace).toHaveBeenCalledTimes(1)
    })

    it('insert with move', () => {
      prev = [3, 1, 2]
      next = [1, 4, 3, 2]
      run()
      expect(parent).toMatchSnapshot()
      expect(insert).toHaveBeenCalledTimes(2)
      expect(remove).toHaveBeenCalledTimes(0)
      expect(append).toHaveBeenCalledTimes(0)
      expect(replace).toHaveBeenCalledTimes(0)
    })
  })
})
