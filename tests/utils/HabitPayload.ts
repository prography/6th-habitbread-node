export class Payload {
  public static originalPayloads = [
    {
      title: 'habit1',
      description: '이건 description1입니다.',
      category: 'test',
      isScheduled: false,
    },
    {
      title: ' habit2',
      description: '이건 description2입니다.',
      category: 'test',
      isScheduled: false,
    },
    {
      title: 'habit3',
      description: '이건 description3입니다.',
      category: 'test',
      isScheduled: false,
    },
  ];

  public static checkOriginalPayloads = (userId: number, habitId: number) => {
    return {
      habits: [
        {
          category: 'test',
          description: '이건 description1입니다.',
          habitId: habitId,
          title: 'habit1',
          userId,
        },
        {
          category: 'test',
          description: '이건 description2입니다.',
          habitId: habitId + 1,
          title: ' habit2',
          userId,
        },
        {
          category: 'test',
          description: '이건 description3입니다.',
          habitId: habitId + 2,
          title: 'habit3',
          userId,
        },
      ],
    };
  };

  public static updatePayloads = [
    {
      title: '수정된 - habit1',
      description: '이건 수정된 description1입니다.',
      category: 'testUpdate',
      isScheduled: true,
    },
    {
      title: '수정된 -  habit2',
      description: '이건 수정된 description2입니다.',
      category: 'testUpdate',
      isScheduled: true,
    },
    {
      title: '수정된 - habit3',
      description: '이건 수정된 description3입니다.',
      category: 'testUpdate',
      isScheduled: true,
    },
  ];
}
