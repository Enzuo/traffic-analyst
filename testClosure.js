function createObject () {
  let foo

  function setFoo(obj){
    foo = obj
  }

  function getFoo() {
    return foo
  }

  return {
    foo,
    setFoo, 
    get getterFoo() { return foo },
    getFoo
  }
}


let o = createObject()
console.log("first access", o.foo, o.getterFoo, o.getFoo())

o.setFoo({ bar : 5})

console.log("after update access", o.foo, o.getterFoo, o.getFoo())

console.log('is equal ? ', o.foo === o.getterFoo, o.getterFoo === o.getFoo())

o.setFoo((x) => x)

console.log('is equal ? ', o.foo === o.getterFoo, o.getterFoo === o.getterFoo)
