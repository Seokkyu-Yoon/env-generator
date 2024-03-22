type EnvValue = string[] | number | boolean | null

function textByLines(...text: string[]) {
  return text.reduce<string[]>((bucket, t) => {
    bucket.push(...t.split('\n'))
    return bucket
  }, [])
}

abstract class EnvItem {
  abstract get String(): string
  abstract get Object(): Record<string, EnvValue> | null
}

abstract class EnvItemRecord extends EnvItem {
  protected key
  protected abstract value: EnvValue

  protected constructor(key: string) {
    super()
    this.key = key
  }
}

class EnvItemBlank extends EnvItem {
  readonly String = ''
  readonly Object = null
}

class EnvItemComment extends EnvItem {
  private readonly lines

  constructor(...text: string[]) {
    super()
    this.lines = textByLines(...text)
  }

  get String(): string {
    return this.lines.map((l) => `#${l}`).join('\n')
  }

  readonly Object = null
}

class EnvItemNull extends EnvItemRecord {
  protected value = null

  public constructor(key: string) {
    super(key)
  }

  get String(): string {
    return `${this.key}=${this.value}`
  }

  get Object(): Record<string, null> {
    const obj: Record<string, null> = {}
    obj[this.key] = this.value
    return obj
  }
}

class EnvItemBoolean extends EnvItemRecord {
  protected value

  constructor(key: string, value: boolean) {
    super(key)
    this.value = value
  }

  get String(): string {
    return `${this.key}=${this.value}`
  }

  get Object(): Record<string, boolean> {
    const obj: Record<string, boolean> = {}
    obj[this.key] = this.value
    return obj
  }
}

class EnvItemNumber extends EnvItemRecord {
  protected value

  constructor(key: string, value: number) {
    super(key)
    this.value = value
  }

  get String(): string {
    return `${this.key}=${this.value}`
  }

  get Object(): Record<string, number> {
    const obj: Record<string, number> = {}
    obj[this.key] = this.value
    return obj
  }
}

class EnvItemString extends EnvItemRecord {
  protected value

  constructor(key: string, ...value: string[]) {
    super(key)
    this.value = textByLines(...value)
  }

  get String(): string {
    if (this.value.length > 1)
      return `${this.key}="${this.value.map((l) => l.replace(/"/g, '\\"')).join('\n')}"`
    if (this.value.length === 0) return `${this.key}=`
    const str = this.value[0]
    if (str.includes('"') || str.includes("'") || str.includes(' ')) {
      return `${this.key}="${str.replace(/"/g, '\\"')}"`
    }
    return `${this.key}=${str}`
  }

  get Object(): Record<string, string[]> {
    const obj: Record<string, string[]> = {}
    obj[this.key] = this.value
    return obj
  }
}

export class EnvBuilder {
  private readonly envItems: EnvItem[] = []

  static comment(...text: string[]) {
    return new EnvBuilder().comment(...text)
  }

  comment(...text: string[]) {
    this.envItems.push(new EnvItemComment(...text))
    return this
  }

  static blank() {
    return new EnvBuilder().blank()
  }

  blank() {
    this.envItems.push(new EnvItemBlank())
    return this
  }

  static null(key: string) {
    return new EnvBuilder().null(key)
  }

  null(key: string) {
    this.envItems.push(new EnvItemNull(key))
    return this
  }

  static number(key: string, value: number) {
    return new EnvBuilder().number(key, value)
  }

  number(key: string, value: number) {
    this.envItems.push(new EnvItemNumber(key, value))
    return this
  }

  static boolean(key: string, value: boolean) {
    return new EnvBuilder().boolean(key, value)
  }

  boolean(key: string, value: boolean) {
    this.envItems.push(new EnvItemBoolean(key, value))
    return this
  }

  static string(key: string, ...value: string[]) {
    return new EnvBuilder().string(key, ...value)
  }

  string(key: string, ...value: string[]) {
    this.envItems.push(new EnvItemString(key, ...value))
    return this
  }

  get String() {
    return this.envItems.map((envItem) => envItem.String).join('\n')
  }

  get Object() {
    return this.envItems.reduce<Record<string, EnvValue>>(
      (bucket, envItem) => ({
        ...bucket,
        ...(envItem.Object !== null && envItem.Object),
      }),
      {},
    )
  }
}
