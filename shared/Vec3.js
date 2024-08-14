// Full credits to BloomCore
export default class Vec3 {
    static fromCoords = (x0, y0, z0, x1, y1, z1) => new Vec3(x1-x0, y1-y0, z1-z0)

    static fromPitchYaw = (pitch, yaw) => {
        const f = Math.cos(-yaw * 0.017453292 - Math.PI)
        const f1 = Math.sin(-yaw * 0.017453292 - Math.PI)
        const f2 = -Math.cos(-pitch * 0.017453292)
        const f3 = Math.sin(-pitch * 0.017453292)
        return new Vec3(f1*f2, f3, f*f2).normalize()
    }

    constructor(x, y, z) {
        this.x = x ?? 0
        this.y = y ?? 0
        this.z = z ?? 0
    }

    /**
     * Returns the x, y and z components of the vector as [x, y, z]
     * @returns {[number, number, number]}
     */
    getComponents() {
        return [this.x, this.y, this.z]
    }

    /**
     * Subtracts a vector from this vector.
     * @param {Vec3} vec3
     */
    subtract(vec3) {
        return new Vec3(
            this.x - vec3.x,
            this.y - vec3.y,
            this.z - vec3.z
        )
    }

    /**
     * Adds another Vector3 or 3d coordinate to this vector.
     * @param {Vec3 | [number, number, number]} vec3
     */
    add(vec3) {
        if (vec3 instanceof Vector3) {
            this.x += vec3.x
            this.y += vec3.y
            this.z += vec3.z
            return this
        }
        this.x += vec3[0]
        this.y += vec3[1]
        this.z += vec3[2]
        return this
    }

    /**
     * Returns the dot product of two vectors.
     * @param {Vec3} vec3
     * @returns {number}
     */
    dotProduct(vec3) {
        let [x1, y1, z1] = this.getComponents()
        let [x2, y2, z2] = vec3.getComponents()
        return (x1*x2) + (y1*y2) + (z1*z2)
    }

    /**
     * Returns the cross product of two vectors
     * @param {Vec3} vec3
     * @returns {Vec3}
     */
    crossProduct(vec3) {
        let [x1, y1, z1] = this.getComponents()
        let [x2, y2, z2] = vec3.getComponents()
        return new Vec3(
            (y1*z2) - (z1*y2),
            -((x1*z1) - (z1*x2)),
            (x1*y2) - (y1*x2)
        )
    }

    /**
     * Gets the length of the vector
     * @returns {number}
     */
    getLength() {
        return Math.sqrt(this.x**2 + this.y**2 + this.z**2)
    }

    /**
     * Gets the angle between this and another vector in radians
     * @param {Vec3} vec3
     * @returns {number}
     */
    getAngleRad(vec3) {
        return Math.acos(this.dotProduct(vec3) / (this.getLength() * vec3.getLength()))
    }

    /**
     * Gets the angle between this and another vector in degrees
     * @param {Vec3} vec3
     * @returns {number}
     */
    getAngleDeg(vec3) {
        return 180/Math.PI * this.getAngleRad(vec3)
    }

    /**
     * Gets the equation for the plane from three points.
     * @param {number[]} point1
     * @param {number[]} point2
     * @param {number[]} point3
     * @returns {number[]} - An array of numbers containing the [x, y, z, extra].
     */
    getPlaneEquation(point1, point2, point3) {
        let [p1x, p1y, p1z] = point1
        let [p2x, p2y, p2z] = point2
        let [p3x, p3y, p3z] = point3
        let d1 = new Vec3(p2x - p1x, p2y - p1y, p2z - p1z)
        let d2 = new Vec3(p3x - p1x, p3y - p1y, p3z - p1z)
        let normal = d1.crossProduct(d2)
        return [
            ...normal.getComponents(),
            -(new Vec3(...point1).dotProduct(normal))
        ]
    }

    /**
     * Normalizes the vector
     * @returns {Vec3}
     */
    normalize() {
        const len = this.getLength()
        this.x = this.x / len
        this.y = this.y / len
        this.z = this.z / len
        return this
    }

    getYaw() {
        this.normalize()
        return 180/Math.PI * -Math.atan2(this.x, this.z)
    }

    getPitch() {
        this.normalize()
        return 180/Math.PI * (-Math.asin(this.y))
    }
    
    toString() {
        return `Vector3(x=${this.x},y=${this.y},z=${this.z})`
    }
    /**
     * Rotates a vector in the clockwise direction. Returns itself to enable chaining methods.
     * @param {number} degrees - How much to rotate the vector by. Only accepts degrees which are a multiple of 90.
     * @returns {Vec3} - The rotated version of this vector.
     */
    rotate(degrees, reverse=false) {
        if (reverse) degrees = (360 - degrees)%360
        switch (degrees) {
            case 90:
                ;[this.x, this.z] = [this.z, -this.x]
                break
            case 180:
                ;[this.x, this.z] = [-this.x, -this.z]
                break
            case 270:
                ;[this.x, this.z] = [-this.z, this.x]
                break
        }
        return this
    }
    multiply(factor) {
        this.x *= factor
        this.y *= factor
        this.z *= factor
        return this
    }

    getX() {
        return this.x
    }
    
    getY() {
        return this.y
    }

    getZ() {
        return this.z
    }

    /**
     * Creates a new Vec3 object identical to this one.
     * @returns {Vec3} - A new Vec3 with the same x, y and z component.
     */
    copy() {
        return new Vec3(this.x, this.y, this.z)
    }
}