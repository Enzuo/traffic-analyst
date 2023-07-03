import { parseEngineSpec } from "./carlib"

test('can process empty engine spec', () => {
  const spec = ''
  const torqueCurve = parseEngineSpec(spec)
  expect(torqueCurve).toStrictEqual([])

})

test('can process engine spec hp', () => {
  const spec = '245nm@1750 109hp@4000'
  const torqueCurve = parseEngineSpec(spec)
  expect(torqueCurve).toStrictEqual([
    [ 1000, 171.5 ],
    [ 1750, 245 ],
    [ 4000, 191.38431361218753 ]
  ])
})

test('can process engine spec hp', () => {
  const spec = '145NM@4000 78kw@5500'
  const torqueCurve = parseEngineSpec(spec)
  expect(torqueCurve).toStrictEqual([
    [ 1000, 101.5 ],
    [ 4000, 145 ],
    [ 5500, 135.42218181818183 ]
  ])
})
