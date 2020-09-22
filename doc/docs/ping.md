---
id: ping
title: ping
sidebar_label: ping
---

消息体
```
 {
            body: {
                content: {
                   memberMCode,
                   orgMCode
                },
            },
            header: {
                id,
                action: "ping"
                did,
                uid,
                time,
                timeout,
                verion
            }
            
 }
```

## 说明
1. 由客户端发起
2. ping主要作用是比较memberMCode和orgMCode, 如果发现不同则同步更新
3. ping周期为60s, 循环往复
4. timeout: 30s