# [typeorm](https://typeorm.io)
> 中文文档：typeorm.bootcss.com

## subscribers
订阅者的作用在于可以在CRUD(创建,查询,更新,删除)数据时创建一个钩子方法来执行额外的操作

比如这个`PostSubscriber`钩子可以让我们在查询文章时对HTML类型的文章内容进行防注入处理

```ts
// src/modules/content/subscribers/post.subscriber.ts
@EventSubscriber()
export class PostSubscriber {
  constructor(
    protected dataSource: DataSource,
    protected sanitizeService: SanitizeService,
    protected postRepository: PostRepository,
  ) {}

  listenTo() {
    return PostEntity;
  }

  /**
   * 加载文章数据的处理
   * @param entity
   */
  async afterLoad(entity: PostEntity) {
    if (entity.type === PostBodyType.HTML) {
      entity.body = this.sanitizeService.sanitize(entity.body);
    }
  }
}
```

## entites
TypeORM中模型就是所谓的Entity类，编写方法如下

- `@Entity`装饰器中的`'content_posts'`代表数据表的名称
- `@CreateDateColumn`与`@UpdateDateColumn`是由TypeORM自动维护的字段，用于数据创建和更新时间，我们后面讲到软删除还会使用到`@DeleteDateColumn`，这也是有TypeORM自动维护的
- 其它字段可以参考`comment`中的注释
```ts
// src/modules/content/entities/post.entity.ts
@Entity('content_posts')
export class PostEntity extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ comment: '文章标题' })
    title!: string;

    @Column({ comment: '文章内容', type: 'longtext' })
    body!: string;

    @Column({ comment: '文章描述', nullable: true })
    summary?: string;

    @Column({ comment: '关键字', type: 'simple-array', nullable: true })
    keywords?: string[];

    @Column({
        comment: '文章类型',
        type: 'enum',
        enum: PostBodyType,
        default: PostBodyType.MD,
    })
    type!: PostBodyType;

    @Column({
        comment: '发布时间',
        type: 'varchar',
        nullable: true,
    })
    publishedAt?: Date | null;

    @Column({ comment: '文章排序', default: 0 })
    customOrder!: number;

  @CreateDateColumn({
    comment: '创建时间',
  })
    createdAt!: Date;

    @UpdateDateColumn({
        comment: '更新时间',
    })
    updatedAt!: Date;
}
```

## controllers


## services
一般不会通过控制器来直接操作数据，而是通过服务来通过DataMapper或ActiveRecord模式对数据进行操作

可以看到我们前面定义的`IPaginateDto`接口在此处查询分页的方法中就可以作为类型提示了，另外通过`QueryHook`类型提示的`callback`回调函数参数还能用于添加自定义的`query`查询链，下面逐个分析一下

- `paginate`方法用于查询文章列表,并以分页的形式返回数据
- `detail`方法用于查询一篇文章的详情
- `create`,`update`,`delete`方法分别用于创建，更新和删除文章

这里我们重点来看一下`buildListQuery`这个非公开方法，此方法的作用在于

- 如果传入的`isPublished`值是一个布尔值(默认为`undefined`)则会根据是否为真来确定是否只查询发布或未发布的文章,默认查询所有文章
- 添加一个排序功能，可以根据自定义的`customOrder`字段排序，也可以根据文章的创建时间，更新时间或发布时间排序，默认为综合排序
- 同时如果有传入自定义的查询回调，还回执行以下查询回调返回一个新的查询器

```ts
@Injectable()
export class PostService {
    constructor(protected repository: PostRepository) {}

    /**
     * 获取分页数据
     * @param options 分页选项
     * @param callback 添加额外的查询
     */
    async paginate(options: PaginateOptions, callback?: QueryHook<PostEntity>) {
        const qb = await this.buildListQuery(this.repository.buildBaseQB(), options, callback);
        return paginate(qb, options);
    }

    /**
     * 查询单篇文章
     * @param id
     * @param callback 添加额外的查询
     */
    async detail(id: string, callback?: QueryHook<PostEntity>) {
         let qb = this.repository.buildBaseQB();
        qb.where(`post.id = :id`, { id });
        qb = !isNil(callback) && isFunction(callback) ? await callback(qb) : qb;
        const item = await qb.getOne();
        if (!item) throw new EntityNotFoundError(PostEntity, `The post ${id} not exists!`);
        return item;
    }

    /**
     * 创建文章
     * @param data
     */
    async create(data: Record<string, any>) {
        const item = await this.repository.save(data);

        return this.detail(item.id);
    }

    /**
     * 更新文章
     * @param data
     */
    async update(data: Record<string, any>) {
        await this.repository.update(data.id, omit(data, ['id']));
        return this.detail(data.id);
    }

    /**
     * 删除文章
     * @param id
     */
    async delete(id: string) {
        const item = await this.repository.findOneByOrFail({ id });
        return this.repository.remove(item);
    }

    /**
     * 构建文章列表查询器
     * @param qb 初始查询构造器
     * @param options 排查分页选项后的查询选项
     * @param callback 添加额外的查询
     */
    protected async buildListQuery(
        qb: SelectQueryBuilder<PostEntity>,
        options: Record<string, any>,
        callback?: QueryHook<PostEntity>,
    ) {
        const { orderBy, isPublished } = options;
        let newQb = qb;
        if (typeof isPublished === 'boolean') {
            newQb = isPublished
                ? newQb.where({
                      publishedAt: Not(IsNull()),
                  })
                : newQb.where({
                      publishedAt: IsNull(),
                  });
        }
        newQb = this.queryOrderBy(newQb, orderBy);
        if (callback) return callback(newQb);
        return newQb;
    }

    /**
     *  对文章进行排序的Query构建
     * @param qb
     * @param orderBy 排序方式
     */
    protected queryOrderBy(qb: SelectQueryBuilder<PostEntity>, orderBy?: PostOrderType) {
        switch (orderBy) {
            case PostOrderType.CREATED:
                return qb.orderBy('post.createdAt', 'DESC');
            case PostOrderType.UPDATED:
                return qb.orderBy('post.updatedAt', 'DESC');
            case PostOrderType.PUBLISHED:
                return qb.orderBy('post.publishedAt', 'DESC');
            case PostOrderType.CUSTOM:
                return qb.orderBy('customOrder', 'DESC');
            default:
                return qb
                    .orderBy('post.createdAt', 'DESC')
                    .addOrderBy('post.updatedAt', 'DESC')
                    .addOrderBy('post.publishedAt', 'DESC');
        }
    }
}
```

## DTO
dto是用于对请求数据结构进行定义的一个类，用于aop编程。常用于对body,query等请求数据进行验证 我们常用的验证库为class-validator 对于body和query数据的验证一般使用dto+ValidationPipe这个预定义管道(本节下面的内容会自定义一个全局管道代替这个预定义管道) 对于param数据的验证一般直接使用预定义或者自定义的非全局管道,比如ParseUUIDPipe

## provider
通俗的来讲，提供者就是通过类型提示或者标识符的方式使某个类或函数以依赖注入的方式在其它需要使用到它的地方进行实例化 同时也是Nestjs，Laravel，Symfony以及Spring,Angular等现代web框架的核心所在

在nestjs中如果要使一个类变成提供者，需要在其顶部添加@Injectale()装饰器 以一个服务类为例
```ts
@Injectable()
export class PostService {
    protected posts: PostEntity[] = [
        { title: '第一篇文章标题', body: '第一篇文章内容' },
        { title: '第二篇文章标题', body: '第二篇文章内容' },
        { title: '第三篇文章标题', body: '第三篇文章内容' },
        { title: '第四篇文章标题', body: '第四篇文章内容' },
        { title: '第五篇文章标题', body: '第五篇文章内容' },
        { title: '第六篇文章标题', body: '第六篇文章内容' },
    ].map((v, id) => ({ ...v, id }));

    async findAll() {
        return this.posts;
    }

    async findOne(id: number) {
        const post = this.posts.find((item) => item.id === id);
        if (isNil(post)) throw new NotFoundException(`the post with id ${id} not exits!`);
        return post;
    }

    async create(data: CreatePostDto) {
        const newPost: PostEntity = {
            id: Math.max(...this.posts.map(({ id }) => id + 1)),
            ...data,
        };
        this.posts.push(newPost);
        return newPost;
    }

    async update(data: UpdatePostDto) {
        let toUpdate = this.posts.find((item) => item.id === data.id);
        if (isNil(toUpdate)) throw new NotFoundException(`the post with id ${data.id} not exits!`);
        toUpdate = { ...toUpdate, ...data };
        this.posts = this.posts.map((item) => (item.id === data.id ? toUpdate : item));
        return toUpdate;
    }

    async delete(id: number) {
        const toDelete = this.posts.find((item) => item.id === id);
        if (isNil(toDelete)) throw new NotFoundException(`the post with id ${id} not exits!`);
        this.posts = this.posts.filter((item) => item.id !== id);
        return toDelete;
    }
}
```

`注册提供者:`
创建完提供者后应把提供者类放到模块的providers数组中以注册
