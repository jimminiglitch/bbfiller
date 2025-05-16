// 3D Rave City - Dancers System

const RaveCity = window.RaveCity || {}

// Dancers System
RaveCity.Dancers = {
  // Dancer collections
  dancers: [],
  regularPeople: [],

  // Dancer models and animations
  dancerModels: [],
  dancerAnimations: [],

  // Body part colors
  bodyColors: [
    0xffb6c1, // light pink
    0xffd700, // gold
    0xadd8e6, // light blue
    0x90ee90, // light green
    0xf08080, // light coral
    0xe6e6fa, // lavender
    0xffa07a, // light salmon
    0xd8bfd8, // thistle
    0xffe4b5, // moccasin
    0xafeeee, // pale turquoise
  ],

  // Clothing colors
  clothingColors: [
    0xff00ff, // magenta
    0x00ffff, // cyan
    0xffff00, // yellow
    0xff0000, // red
    0x0000ff, // blue
    0x00ff00, // green
    0xff8c00, // dark orange
    0x8a2be2, // violet
    0x00fa9a, // medium spring green
    0xff1493, // deep pink
  ],

  // Hair styles
  hairStyles: ["short", "long", "mohawk", "afro", "bald", "ponytail"],

  // Dance moves
  danceMoves: ["bounce", "spin", "wave", "shuffle", "headbang", "robot"],

  // Initialize dancers system
  init: function (scene) {
    this.scene = scene
    this.createDancers()
    return this
  },

  // Create dancers
  createDancers: function () {
    // Clear existing dancers
    this.dancers.forEach((dancer) => {
      this.scene.remove(dancer)
    })
    this.regularPeople.forEach((person) => {
      this.scene.remove(person)
    })

    this.dancers = []
    this.regularPeople = []

    // Create dancers based on config
    for (let i = 0; i < RaveCity.Config.dancerCount; i++) {
      // Random position
      const x = (Math.random() - 0.5) * 400
      const z = (Math.random() - 0.5) * 400

      const dancer = this.createDancer(x, 0, z, true)
      this.dancers.push(dancer)
    }

    // Create regular people
    for (let i = 0; i < RaveCity.Config.regularPeopleCount; i++) {
      // Random position
      const x = (Math.random() - 0.5) * 400
      const z = (Math.random() - 0.5) * 400

      const person = this.createDancer(x, 0, z, false)
      this.regularPeople.push(person)
    }
  },

  // Create a single dancer
  createDancer: function (x, y, z, isDancing) {
    // Determine detail level based on config
    const detail = this.getDetailLevel(RaveCity.Config.dancerDetail)

    // Create a dancer with more anatomical detail
    const dancer = new THREE.Group()

    // Random properties
    const height = 1.5 + Math.random() * 0.5 // Height between 1.5 and 2.0
    const bodyColor = this.bodyColors[Math.floor(Math.random() * this.bodyColors.length)]
    const clothingColor = this.clothingColors[Math.floor(Math.random() * this.clothingColors.length)]
    const hairStyle = this.hairStyles[Math.floor(Math.random() * this.hairStyles.length)]
    const danceMove = this.danceMoves[Math.floor(Math.random() * this.danceMoves.length)]

    // Create body parts
    const bodyParts = this.createBodyParts(height, bodyColor, clothingColor, hairStyle, detail)

    // Add body parts to dancer
    Object.values(bodyParts).forEach((part) => {
      dancer.add(part)
    })

    // Position dancer
    dancer.position.set(x, y, z)

    // Add animation data
    dancer.userData = {
      isDancing: isDancing,
      danceMove: danceMove,
      danceSpeed: 0.5 + Math.random() * 1.5,
      danceOffset: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.05,
      bodyParts: bodyParts,
      height: height,
    }

    this.scene.add(dancer)
    return dancer
  },

  // Create body parts for a dancer
  createBodyParts: (height, bodyColor, clothingColor, hairStyle, detail) => {
    const bodyParts = {}
    const scale = height / 2

    // Materials
    const skinMaterial = new THREE.MeshBasicMaterial({
      color: bodyColor,
      wireframe: detail.wireframe,
    })

    const clothingMaterial = new THREE.MeshBasicMaterial({
      color: clothingColor,
      wireframe: detail.wireframe,
    })

    const hairMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000, // Default black hair
      wireframe: detail.wireframe,
    })

    // Torso (body)
    bodyParts.torso = new THREE.Mesh(
      new THREE.CylinderGeometry(scale * 0.4, scale * 0.3, scale * 0.7, detail.segments),
      clothingMaterial,
    )
    bodyParts.torso.position.y = scale * 0.7

    // Head
    bodyParts.head = new THREE.Mesh(
      new THREE.SphereGeometry(scale * 0.25, detail.segments, detail.segments),
      skinMaterial,
    )
    bodyParts.head.position.y = scale * 1.4

    // Hair based on style
    switch (hairStyle) {
      case "short":
        bodyParts.hair = new THREE.Mesh(
          new THREE.SphereGeometry(scale * 0.26, detail.segments, detail.segments, 0, Math.PI * 2, 0, Math.PI / 2),
          hairMaterial,
        )
        bodyParts.hair.position.y = scale * 1.53
        break
      case "long":
        bodyParts.hair = new THREE.Mesh(
          new THREE.CylinderGeometry(scale * 0.26, scale * 0.2, scale * 0.5, detail.segments),
          hairMaterial,
        )
        bodyParts.hair.position.y = scale * 1.5
        break
      case "mohawk":
        bodyParts.hair = new THREE.Mesh(new THREE.BoxGeometry(scale * 0.05, scale * 0.15, scale * 0.4), hairMaterial)
        bodyParts.hair.position.y = scale * 1.6
        break
      case "afro":
        bodyParts.hair = new THREE.Mesh(
          new THREE.SphereGeometry(scale * 0.35, detail.segments, detail.segments),
          hairMaterial,
        )
        bodyParts.hair.position.y = scale * 1.5
        break
      case "ponytail":
        bodyParts.hair = new THREE.Group()
        const top = new THREE.Mesh(
          new THREE.SphereGeometry(scale * 0.26, detail.segments, detail.segments, 0, Math.PI * 2, 0, Math.PI / 2),
          hairMaterial,
        )
        top.position.y = scale * 1.53

        const tail = new THREE.Mesh(
          new THREE.CylinderGeometry(scale * 0.1, scale * 0.05, scale * 0.3, detail.segments),
          hairMaterial,
        )
        tail.position.set(0, scale * 1.4, -scale * 0.2)
        tail.rotation.x = Math.PI / 4

        bodyParts.hair.add(top)
        bodyParts.hair.add(tail)
        break
      // Bald has no hair
    }

    // Arms
    bodyParts.leftArm = new THREE.Group()
    bodyParts.rightArm = new THREE.Group()

    // Upper arms
    const upperLeftArm = new THREE.Mesh(
      new THREE.CylinderGeometry(scale * 0.1, scale * 0.1, scale * 0.4, detail.segments),
      skinMaterial,
    )
    upperLeftArm.position.y = -scale * 0.2

    const upperRightArm = upperLeftArm.clone()

    // Lower arms
    const lowerLeftArm = new THREE.Mesh(
      new THREE.CylinderGeometry(scale * 0.08, scale * 0.08, scale * 0.4, detail.segments),
      skinMaterial,
    )
    lowerLeftArm.position.y = -scale * 0.6

    const lowerRightArm = lowerLeftArm.clone()

    // Hands
    const leftHand = new THREE.Mesh(
      new THREE.SphereGeometry(scale * 0.08, detail.segments, detail.segments),
      skinMaterial,
    )
    leftHand.position.y = -scale * 0.8

    const rightHand = leftHand.clone()

    // Add parts to arm groups
    bodyParts.leftArm.add(upperLeftArm)
    bodyParts.leftArm.add(lowerLeftArm)
    bodyParts.leftArm.add(leftHand)

    bodyParts.rightArm.add(upperRightArm)
    bodyParts.rightArm.add(lowerRightArm)
    bodyParts.rightArm.add(rightHand)

    // Position arms
    bodyParts.leftArm.position.set(scale * 0.4, scale * 0.9, 0)
    bodyParts.rightArm.position.set(-scale * 0.4, scale * 0.9, 0)

    // Legs
    bodyParts.leftLeg = new THREE.Group()
    bodyParts.rightLeg = new THREE.Group()

    // Upper legs
    const upperLeftLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(scale * 0.15, scale * 0.1, scale * 0.5, detail.segments),
      clothingMaterial,
    )
    upperLeftLeg.position.y = -scale * 0.25

    const upperRightLeg = upperLeftLeg.clone()

    // Lower legs
    const lowerLeftLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(scale * 0.1, scale * 0.1, scale * 0.5, detail.segments),
      skinMaterial,
    )
    lowerLeftLeg.position.y = -scale * 0.75

    const lowerRightLeg = lowerLeftLeg.clone()

    // Feet
    const leftFoot = new THREE.Mesh(
      new THREE.BoxGeometry(scale * 0.1, scale * 0.05, scale * 0.2),
      new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: detail.wireframe }),
    )
    leftFoot.position.set(0, -scale * 1.0, scale * 0.05)

    const rightFoot = leftFoot.clone()

    // Add parts to leg groups
    bodyParts.leftLeg.add(upperLeftLeg)
    bodyParts.leftLeg.add(lowerLeftLeg)
    bodyParts.leftLeg.add(leftFoot)

    bodyParts.rightLeg.add(upperRightLeg)
    bodyParts.rightLeg.add(lowerRightLeg)
    bodyParts.rightLeg.add(rightFoot)

    // Position legs
    bodyParts.leftLeg.position.set(scale * 0.2, scale * 0.35, 0)
    bodyParts.rightLeg.position.set(-scale * 0.2, scale * 0.35, 0)

    return bodyParts
  },

  // Get detail level settings
  getDetailLevel: (detailLevel) => {
    switch (detailLevel) {
      case "low":
        return { segments: 4, wireframe: true }
      case "medium":
        return { segments: 8, wireframe: true }
      case "high":
        return { segments: 12, wireframe: false }
      default:
        return { segments: 8, wireframe: true }
    }
  },

  // Update dancers
  update: function (time, deltaTime, audioData) {
    // Update dancers
    this.dancers.forEach((dancer) => {
      if (!dancer.userData) return

      // Apply dance move
      this.applyDanceMove(dancer, time, audioData)

      // Rotate dancer
      dancer.rotation.y += dancer.userData.rotationSpeed
    })

    // Update regular people (less movement)
    this.regularPeople.forEach((person) => {
      if (!person.userData) return

      // Slight movement
      person.rotation.y += person.userData.rotationSpeed * 0.2

      // Random idle animations
      if (Math.random() > 0.99) {
        const randomPart = Object.keys(person.userData.bodyParts)[Math.floor(Math.random() * 7)]
        const part = person.userData.bodyParts[randomPart]
        if (part) {
          part.rotation.z = (Math.random() - 0.5) * 0.2
        }
      }
    })
  },

  // Apply dance move to dancer
  applyDanceMove: (dancer, time, audioData) => {
    if (!dancer.userData || !dancer.userData.bodyParts) return

    const parts = dancer.userData.bodyParts
    const danceSpeed = dancer.userData.danceSpeed
    const danceOffset = dancer.userData.danceOffset
    const bassImpact = audioData ? audioData.bassFrequency * RaveCity.Config.bassImpact : 0

    // Reset rotations
    Object.values(parts).forEach((part) => {
      if (part.rotation) {
        part.rotation.set(0, 0, 0)
      }
    })

    // Apply dance move based on type
    switch (dancer.userData.danceMove) {
      case "bounce":
        // Bounce up and down
        dancer.position.y = Math.sin(time * danceSpeed + danceOffset) * 0.5 * (1 + bassImpact)

        // Arms up
        if (parts.leftArm) parts.leftArm.rotation.z = -Math.PI / 4 + Math.sin(time * danceSpeed) * 0.2
        if (parts.rightArm) parts.rightArm.rotation.z = Math.PI / 4 - Math.sin(time * danceSpeed) * 0.2
        break

      case "spin":
        // Spin around
        dancer.rotation.y += 0.05 * danceSpeed * (1 + bassImpact)

        // Arms out
        if (parts.leftArm) parts.leftArm.rotation.z = -Math.PI / 2
        if (parts.rightArm) parts.rightArm.rotation.z = Math.PI / 2
        break

      case "wave":
        // Wave arms
        if (parts.leftArm) {
          parts.leftArm.rotation.z = -Math.PI / 4 + Math.sin(time * danceSpeed + danceOffset) * 0.5
          parts.leftArm.rotation.x = Math.cos(time * danceSpeed + danceOffset) * 0.5
        }
        if (parts.rightArm) {
          parts.rightArm.rotation.z = Math.PI / 4 - Math.sin(time * danceSpeed + danceOffset + Math.PI) * 0.5
          parts.rightArm.rotation.x = Math.cos(time * danceSpeed + danceOffset + Math.PI) * 0.5
        }

        // Slight body movement
        if (parts.torso) parts.torso.rotation.y = Math.sin(time * danceSpeed * 0.5) * 0.1
        break

      case "shuffle":
        // Shuffle feet
        if (parts.leftLeg) parts.leftLeg.rotation.z = Math.sin(time * danceSpeed * 2) * 0.2
        if (parts.rightLeg) parts.rightLeg.rotation.z = -Math.sin(time * danceSpeed * 2) * 0.2

        // Move side to side
        dancer.position.x += Math.sin(time * danceSpeed) * 0.02 * (1 + bassImpact)

        // Arms at sides moving slightly
        if (parts.leftArm) parts.leftArm.rotation.z = -0.2 + Math.sin(time * danceSpeed) * 0.1
        if (parts.rightArm) parts.rightArm.rotation.z = 0.2 - Math.sin(time * danceSpeed) * 0.1
        break

      case "headbang":
        // Head banging
        if (parts.head) {
          parts.head.rotation.x = Math.sin(time * danceSpeed * 2) * 0.5 * (1 + bassImpact)
        }
        if (parts.hair) {
          parts.hair.rotation.x = Math.sin(time * danceSpeed * 2 + 0.1) * 0.6 * (1 + bassImpact)
        }

        // Body follows
        if (parts.torso) parts.torso.rotation.x = Math.sin(time * danceSpeed * 2) * 0.2
        break

      case "robot":
        // Robot dance moves - sharp, angular movements
        if (parts.leftArm) {
          parts.leftArm.rotation.z = (-Math.PI / 2) * Math.round(Math.sin(time * danceSpeed * 0.5))
          parts.leftArm.rotation.x = (Math.PI / 2) * Math.round(Math.cos(time * danceSpeed * 0.7))
        }
        if (parts.rightArm) {
          parts.rightArm.rotation.z = (Math.PI / 2) * Math.round(Math.sin(time * danceSpeed * 0.7))
          parts.rightArm.rotation.x = (Math.PI / 2) * Math.round(Math.cos(time * danceSpeed * 0.5))
        }

        // Head turns
        if (parts.head) {
          parts.head.rotation.y = (Math.PI / 4) * Math.round(Math.sin(time * danceSpeed))
        }
        break

      default:
        // Default simple dance
        dancer.position.y = Math.sin(time * danceSpeed + danceOffset) * 0.3

        if (parts.leftArm) parts.leftArm.rotation.z = -0.3 + Math.sin(time * danceSpeed) * 0.2
        if (parts.rightArm) parts.rightArm.rotation.z = 0.3 - Math.sin(time * danceSpeed) * 0.2
    }

    // Add bass impact to all dancers
    if (bassImpact > 0.5) {
      dancer.position.y += bassImpact * 0.2

      if (Math.random() > 0.8) {
        // Random arm movements on bass hits
        if (parts.leftArm) parts.leftArm.rotation.z += (Math.random() - 0.5) * bassImpact * 0.5
        if (parts.rightArm) parts.rightArm.rotation.z += (Math.random() - 0.5) * bassImpact * 0.5
      }
    }
  },

  // Create a dancer at a specific position
  createDancerAt: function (x, y, z, isDancing) {
    const dancer = this.createDancer(x, y, z, isDancing)
    if (isDancing) {
      this.dancers.push(dancer)
    } else {
      this.regularPeople.push(dancer)
    }
    return dancer
  },
}
