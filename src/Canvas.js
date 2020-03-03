import React, { useEffect, useRef, useState } from 'react'

// const Point = azimuth => {
//   const az = Math.PI - azimuth
//   const components = {
//     x: Math.cos(az),
//     y: Math.sin(az),
//   }
//   //   const acceleration = -0.3 + Math.random() * 0.6
//   return components
// }

const getPointPosition = (parent, point) => {
  if (point) {
    console.log(parent.center.x, point.x, parent.radius)
    const position = {
      x: parent.center.x + point.x * parent.radius,
      y: parent.center.y + point.y * parent.radius,
    }
    return position
  }
}

const generatePoints = (numPoints = 32, parent) => {
  const divisional = (Math.PI * 2) / numPoints
  const points = []
  for (let i = 0; i < numPoints; i++) {
    const point = new Point(divisional * (i + 1), parent)
    if (point) {
      points.push(point)
    }
  }

  return points
}

// const setAcceleration = (leftPoint, rightPoint) => {
//     const speed = 1
//     const radialEffect = speed * 5
//     const acceleration = (-0.3 * )
// }

export default function() {
  const canvas = useRef(null)
  const [center, setCenter] = useState({ x: 500, y: 500 })
  const [hover, setHover] = useState(false)
  const [oldMousePoint, setOldMousePoint] = useState({ x: 0, y: 0 })
  const numPoints = 32
  const radius = 150
  const [points, setPoints] = useState(generatePoints(numPoints, { center, radius }))

  const size = 300
  const position = { x: 0.5, y: 0.5 }

  //   useEffect(() => {
  //     setPoints(generatePoints(numPoints, { center, radius }))
  //   }, [center])
  useEffect(() => {
    render()
  }, [])

  const render = () => {
    const { current } = canvas
    const ctx = current.getContext('2d')

    ctx.clearRect(0, 0, current.width, current.height)
    setCenter({ x: current.width * position.x, y: current.height * position.y })
    points[0].solveWith(points[numPoints - 1], points[1])
    let p0 = points[numPoints - 1].position
    let p1 = points[0].position
    //   let p0 = getPointPosition({ center, radius: 150 }, points[numPoints - 1])
    //   let p1 = getPointPosition({ center, radius: 150 }, points[0])
    let _p2 = p1
    ctx.beginPath()
    ctx.moveTo(center.x, center.y)
    ctx.moveTo((p0.x + p1.x) / 2, (p0.y + p1.y) / 2)

    for (let i = 1; i < numPoints; i++) {
      // let p2 = getPointPosition({ center, radius: 150 }, points[i])
      points[i].solveWith(points[i - 1], points[i + 1] || points[0])

      let p2 = points[i].position
      const xc = (p1.x + p2.x) / 2
      const yc = (p1.y + p2.y) / 2
      ctx.quadraticCurveTo(p1.x, p1.y, xc, yc)
      ctx.fillStyle = '#000'
      p1 = p2
    }

    const xc = (p1.x + _p2.x) / 2
    const yc = (p1.y + _p2.y) / 2
    ctx.quadraticCurveTo(p1.x, p1.y, xc, yc)
    ctx.fillStyle = '#000'
    ctx.fill()
    ctx.strokeStyle = '#000'
    ctx.stroke()
    window.requestAnimationFrame(render)
  }

  const mouseMove = e => {
    let pos = center
    let diff = { x: e.clientX - pos.x, y: e.clientY - pos.y }
    let dist = Math.sqrt(diff.x * diff.x + diff.y * diff.y)
    let angle = null
    if (dist < radius && !hover) {
      let vector = { x: e.clientX - pos.x, y: e.clientY - pos.y }
      angle = Math.atan2(vector.y, vector.x)
      setHover(true)
    } else if (dist > radius && hover) {
      let vector = { x: e.clientX - pos.x, y: e.clientY - pos.y }
      angle = Math.atan2(vector.y, vector.x)
      setHover(false)
    }

    if (typeof angle === 'number') {
      let nearestPoint = null
      let distanceFromPoint = 100

      points.forEach((point, i) => {
        if (Math.abs(angle - point.azimuth) < distanceFromPoint) {
          nearestPoint = i
          distanceFromPoint = Math.abs(angle - point.azimuth)
        }
      })
      if (nearestPoint) {
        let strength = { x: oldMousePoint.x - e.clientX, y: oldMousePoint.y - e.clientY }
        strength = Math.sqrt(strength.x * strength.x + strength.y * strength.y) * 10
        if (strength > 100) strength = 100
        const _points = [...points]
        console.log(_points[nearestPoint])
        _points[nearestPoint].acceleration = (strength / 100) * (hover ? -1 : 1)
        setPoints(_points)
      }
    }
    setOldMousePoint({ x: e.clientX, y: e.clientY })
  }

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <canvas ref={canvas} height={size * 3} width={size * 3} onPointerMove={mouseMove}></canvas>
    </div>
  )
}

class Point {
  constructor(azimuth, parent) {
    this.parent = parent
    this.azimuth = Math.PI - azimuth
    this._components = {
      x: Math.cos(this.azimuth),
      y: Math.sin(this.azimuth),
    }

    this.acceleration = -0.3 + Math.random() * 0.6
  }

  solveWith(leftPoint, rightPoint) {
    this.acceleration =
      (-0.3 * this.radialEffect +
        (leftPoint.radialEffect - this.radialEffect) +
        (rightPoint.radialEffect - this.radialEffect)) *
        this.elasticity -
      this.speed * this.friction
  }

  set acceleration(value) {
    if (typeof value == 'number') {
      this._acceleration = value
      this.speed += this._acceleration * 2
    }
  }
  get acceleration() {
    return this._acceleration || 0
  }

  set speed(value) {
    if (typeof value == 'number') {
      this._speed = value
      this.radialEffect += this._speed * 5
    }
  }
  get speed() {
    return this._speed || 0
  }

  set radialEffect(value) {
    if (typeof value == 'number') {
      this._radialEffect = value
    }
  }
  get radialEffect() {
    return this._radialEffect || 0
  }

  get position() {
    return {
      x: this.parent.center.x + this.components.x * (this.parent.radius + this.radialEffect),
      y: this.parent.center.y + this.components.y * (this.parent.radius + this.radialEffect),
    }
  }

  get components() {
    return this._components
  }

  set elasticity(value) {
    if (typeof value === 'number') {
      this._elasticity = value
    }
  }
  get elasticity() {
    return this._elasticity || 0.001
  }
  set friction(value) {
    if (typeof value === 'number') {
      this._friction = value
    }
  }
  get friction() {
    return this._friction || 0.0085
  }
}
