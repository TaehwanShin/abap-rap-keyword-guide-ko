---
title: COMMIT ENTITIES 문
summary: RAP save sequence 를 시작해 transactional buffer 의 변경 내용을 데이터베이스에 저장하고 RAP 트랜잭션을 끝내는 EML 문입니다.
keywords: COMMIT ENTITIES, 커밋, 저장, 저장 순서, save sequence, sy-subrc, COMMIT WORK, RESPONSE OF, RESPONSES OF, IN SIMULATION MODE, COMMIT ENTITIES BEGIN, COMMIT ENTITIES END, 트랜잭션 버퍼
---

## 문법

짧은 형식

```syntax
COMMIT ENTITIES [IN SIMULATION MODE] [RESPONSES response_param].
```

긴 형식

```syntax
COMMIT ENTITIES [IN SIMULATION MODE] RESPONSE OF bdef1 response_param
                                    [RESPONSE OF bdef2 response_param]
                                    [...].
```

동적 형식

```syntax
COMMIT ENTITIES [IN SIMULATION MODE] RESPONSES OF dyn_tab [response_param].
```

BEGIN ... END 형식

```syntax
COMMIT ENTITIES BEGIN [IN SIMULATION MODE]
                      [{RESPONSE OF ... | RESPONSES OF ... } [response_param]].
  [CONVERT KEY OF bdef
     FROM [TEMPORARY] pre_key
     TO final_key.]

COMMIT ENTITIES END.
```

## 설명

`COMMIT ENTITIES` 는 RAP save sequence(저장 순서)를 시작하고 RAP 트랜잭션을 끝냅니다. transactional buffer(트랜잭션 버퍼, 저장하기 전 변경 내용을 잠시 모아 두는 메모리 공간)에 있는 변경, 곧 RAP 트랜잭션 안에서 만들고 고치고 지운 인스턴스가 모두 데이터베이스에 저장됩니다.

EML 의 `MODIFY` 문은 transactional buffer 만 바꿉니다. ABAP 세션이 끝나기 전에 `COMMIT ENTITIES` 로 저장을 시작하지 않으면 변경 내용은 사라집니다. 앞에 `MODIFY` 문이 있었다면, save sequence 를 다 처리한 뒤 `COMMIT WORK` 가 저절로 실행됩니다.

저장은 **모두 아니면 전무**입니다. 인스턴스가 모두 올바르면 모두 저장되고, 하나라도 잘못되면 하나도 저장되지 않습니다.

이 문은 RAP BO consumer(사용자)가 씁니다. behavior pool(동작 풀) 안에서는 쓸 수 없습니다. SAP Fiori 앱이 OData 로 접근하는 경우처럼 RAP 가 직접 지원하는 시나리오에서도 쓰지 않습니다. 그때는 RAP 트랜잭션 엔진이 알아서 저장을 시작합니다.

### 네 가지 형식

- [[abapemlcommit_entities_short|짧은 형식]] : RAP 트랜잭션에서 바뀐 모든 RAP BO 인스턴스를 저장합니다.
- [[abapemlcommit_entities_long|긴 형식]] : 저장하면서 RAP BO entity(엔터티)별로 응답을 따로 받습니다.
- [[abapemlcommit_entities_dyn|동적 형식]] : 대상 root entity(루트 엔터티)를 실행 시점에 정합니다.
- [[abapemlcommit_entities_late|BEGIN ... END 형식]] : late numbering 에서 최종 키를 알아낼 때 씁니다.

네 형식 모두 `IN SIMULATION MODE` 를 붙여 [[abapcommit_entities_simulation|저장을 흉내만 낼]] 수 있습니다.

### sy-subrc

`COMMIT ENTITIES` 는 시스템 필드 `sy-subrc` 를 채웁니다. 저절로 실행되는 `COMMIT WORK` 가 성공한다는 보장은 없으므로 이 값을 꼭 확인합니다. 아래 뜻은 변경 작업이 들어 있는 RAP 트랜잭션을 끝낼 때만 해당합니다.

| `sy-subrc` | 뜻 |
| --- | --- |
| 0 | `COMMIT WORK` 가 성공했습니다. |
| 4 | 저장하지 못했습니다. save sequence 의 앞 단계(saver method(세이버 메서드) `finalize`, `check_before_save`)에서 문제가 생겼습니다. response parameter(응답 매개변수) `failed` 에 내용이 들어옵니다. interaction phase(상호작용 단계)에서 성공한 변경은 transactional buffer 에 그대로 남습니다. |
| 8 | 저장하지 못했습니다. save sequence 의 뒤 단계(saver method `save` 또는 `save_modified`)에서 문제가 생겼습니다. 데이터가 어긋날 수 있어서 transactional buffer 를 비우고 안에서 `ROLLBACK WORK` 를 실행합니다. 그 뒤에 변경 작업을 하면 런타임 오류가 날 수 있습니다. 계속 진행하려면 `ROLLBACK ENTITIES` 를 직접 실행해야 합니다. |

save sequence 에서 실패하면 관련된 모든 RAP BO 의 saver method [[abapsaver_class_cleanup_finalize|cleanup_finalize]] 가 불립니다. 원문은 현재 RAP 트랜잭션의 transactional buffer 를 비우기 위해서라고 설명합니다. 그러면서 `sy-subrc` 가 4 일 때는 interaction phase 에서 성공한 변경이 버퍼에 남는다고도 적고 있습니다. 두 설명이 어떻게 맞물리는지는 원문에 나와 있지 않습니다. 어느 경우든 save sequence 는 인스턴스를 데이터베이스에 쓰지 않고 끝납니다.

## 예제

여행을 하나 만들고 저장합니다. 긴 형식으로 저장 단계의 응답도 받습니다.

```abap
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    CREATE FIELDS ( agencyid customerid begindate enddate )
    WITH VALUE #( ( %cid       = 'cid1'
                    agencyid   = '070001'
                    customerid = '000042'
                    begindate  = '20260301'
                    enddate    = '20260310' ) )
  MAPPED   DATA(ls_mapped)
  FAILED   DATA(ls_failed)
  REPORTED DATA(ls_reported).

" 여기까지는 transactional buffer 만 바뀌었다. 저장을 시작한다
COMMIT ENTITIES
  RESPONSE OF zr_travel
    FAILED   DATA(ls_failed_late)
    REPORTED DATA(ls_reported_late).

IF sy-subrc <> 0.
  " 저장하지 못했다. ls_failed_late 를 보고 처리한다
ENDIF.
```

## 알아두기

- `COMMIT WORK` 도 RAP save sequence 를 시작하고 transactional buffer 의 인스턴스를 저장합니다. 그래도 RAP 에서는 `COMMIT ENTITIES` 를 쓰는 편이 낫습니다. 응답을 받을 수 있고 키 변환도 할 수 있기 때문입니다.
- RAP BO provider(제공자) 안에서는 `COMMIT ENTITIES` 를 쓸 수 없습니다.
- `sy-subrc` 를 확인하지 않으면 문법 경고가 납니다. 응답을 받았다면 `failed` 도 확인해 알맞게 처리합니다.
- interaction phase 에서 읽기만 하고 `COMMIT ENTITIES` 를 실행하면 `cleanup` 메서드만 불립니다.
- projection behavior definition(동작 정의)나 interface behavior definition 으로 접근했을 때, 기반 RAP BO 의 save sequence 에서 저장하지 못한 인스턴스는 RAP BO consumer 에게 돌아옵니다. `failed` response parameter 의 메시지는 projection 에 맞게 자동으로 옮겨집니다.
- EML 문을 반복문 안에 넣지 않습니다. 데이터베이스에 한 건씩 여러 번 접근하게 되어 느려집니다. 필요한 데이터는 EML 문 하나로 읽고, 변경도 한 번에 모아서 요청합니다.

## 관련 항목

- [[abapemlcommit_entities_short]]
- [[abapemlcommit_entities_long]]
- [[abapemlcommit_entities_dyn]]
- [[abapemlcommit_entities_late]]
- [[abapcommit_entities_simulation]]
- [[abencommit_entities_abexas]]
- [[abapeml_response]]
- [[abaprollback_entities]]
- [[abensaver_method_cleanup]]
- [[abenbdl_late_numbering]]
