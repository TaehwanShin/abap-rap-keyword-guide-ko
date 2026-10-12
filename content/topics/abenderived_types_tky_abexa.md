---
title: %tky 사용 예제
summary: draft 를 쓰지 않는 managed RAP BO 와 draft 를 쓰는 managed RAP BO 에서 %tky 로 인스턴스를 가리키는 방법을 견주어 보여 주는 예제입니다.
keywords: %tky, 트랜잭션 키, transactional key, %is_draft, %key, %pky, 초안, draft, Edit, Activate, preserve_changes, 관리형, 예제
---

## 설명

이 예제는 **`%tky`** 를 두 가지 시나리오에서 써 봅니다.

- draft 를 쓰지 않는 managed RAP BO
- draft(`with draft`)을 쓰는 managed RAP BO

`%tky` 는 인스턴스 하나를 빈틈없이 가리키는 데 필요한 것을 모두 묶은 구성요소 묶음입니다. 이 예제처럼 late numbering 을 쓰지 않는 RAP BO 에서는, draft 를 쓰지 않으면 키만 들어 있고 draft 를 쓰면 `%is_draft` 가 함께 들어 있습니다. 그래서 같은 코드로 두 시나리오를 모두 다룰 수 있습니다. late numbering 을 쓰면 `%pid` 도 `%tky` 에 들어갑니다.

### draft 를 쓰지 않는 시나리오

`MODIFY` 요청 하나로 인스턴스를 만들고 곧바로 한 필드를 수정합니다. 생성에서는 키를 여러 표기로 적고, 수정에서는 `%tky-%key-키필드`, `%tky-키필드`, `%tky-%pky-%key-키필드`, `%tky-%pky-키필드` 같은 `%tky` 표기와 그 밖의 표기를 섞어 씁니다. draft 가 없어도 `%tky` 로 키를 가리킬 수 있다는 것을 보여 주려는 것입니다. `COMMIT ENTITIES` 로 persistent table 에 저장합니다.

### draft 를 쓰는 시나리오

active(활성) 인스턴스와 draft 인스턴스를 차례로 다룹니다.

1. **active 인스턴스** — `%is_draft` 를 off 로 하고 인스턴스를 만든 뒤 한 필드를 수정합니다. 수정할 때 `%tky` 안의 `%is_draft` 를 `if_abap_behv=>mk-off` 로 둡니다. `COMMIT ENTITIES` 로 persistent table 에 저장합니다.
2. **draft 로 옮기기** — draft action `Edit` 을 실행하고 `COMMIT ENTITIES` 를 실행합니다. 방금 만든 active 인스턴스의 draft 가 draft 테이블에 생깁니다.
3. **draft 수정** — `%tky` 안의 `%is_draft` 를 `if_abap_behv=>mk-on` 으로 두고 수정합니다. `COMMIT ENTITIES` 를 실행하면 바뀐 값이 draft 테이블에 저장됩니다.
4. **활성화** — draft action `Activate` 를 실행하고 `COMMIT ENTITIES` 를 실행합니다. draft 에서 고친 내용이 persistent table 에 저장됩니다.

## 예제

공통 예제 모델의 `ZR_Travel` 이 draft 를 쓴다고 보고, draft 시나리오의 흐름을 줄여 썼습니다.

```abap
" 1) active 인스턴스를 만들고 고친다 (%is_draft off)
MODIFY ENTITY zr_travel
  CREATE FIELDS ( travelid agencyid customerid )
    WITH VALUE #( ( %cid      = 'cid1'
                    %is_draft = if_abap_behv=>mk-off
                    travelid  = '00000001'
                    agencyid  = '070001'
                    customerid = '000010' ) )
  UPDATE FIELDS ( status )
    WITH VALUE #( ( %tky   = VALUE #( %is_draft = if_abap_behv=>mk-off
                                      travelid  = '00000001' )
                    status = 'O' ) )
  FAILED   DATA(ls_failed)
  REPORTED DATA(ls_reported).
COMMIT ENTITIES.

" 2) active 인스턴스의 draft 를 만든다
MODIFY ENTITY zr_travel
  EXECUTE Edit AUTO FILL CID
    WITH VALUE #( ( %key-travelid           = '00000001'
                    %param-preserve_changes = abap_false ) )
  FAILED   ls_failed
  REPORTED ls_reported.
COMMIT ENTITIES.

" 3) draft 를 고친다 (%is_draft on)
MODIFY ENTITY zr_travel
  UPDATE FIELDS ( status )
    WITH VALUE #( ( %tky   = VALUE #( %is_draft = if_abap_behv=>mk-on
                                      travelid  = '00000001' )
                    status = 'A' ) )
  FAILED   ls_failed
  REPORTED ls_reported.
COMMIT ENTITIES.

" 4) draft 를 활성화한다
MODIFY ENTITY zr_travel
  EXECUTE Activate AUTO FILL CID
    WITH VALUE #( ( %key-travelid = '00000001' ) )
  FAILED   ls_failed
  REPORTED ls_reported.
COMMIT ENTITIES.
```

### 실행하면

- **draft 를 쓰지 않는 시나리오** : persistent table 내용과 `failed` 응답이 나옵니다. `failed` 에는 수정할 수 없었던 인스턴스가 들어 있습니다.
- **draft 시나리오, active 인스턴스** : 저장 뒤 persistent table 내용이 나옵니다.
- **draft 시나리오, draft 인스턴스** : 활성화 전과 후의 draft 테이블·persistent table 을 나란히 보여 줍니다. 활성화 전에는 수정한 값이 draft 테이블에만 있고 persistent table 은 그대로입니다. 활성화 뒤에는 그 값이 persistent table 에 들어가 있고 draft 테이블은 비어 있습니다.

## 알아두기

- `%tky` 안의 키는 `%key-키필드`, `키필드`, `%pky-%key-키필드` 가운데 어느 것으로 적어도 결과가 같습니다. 원문 예제는 설명하려고 일부러 섞어 씁니다.
- 원문 예제의 두 behavior pool(동작 풀)에는 이 예제와 관련된 구현이 없습니다. 두 RAP BO 모두 managed 입니다.
- 원문 예제의 데이터 모델에는 child entity(자식 엔터티)도 있지만 예제에서는 쓰지 않습니다.
- 키 표기와 인스턴스를 가리키는 방법을 한데 정리한 글은 [[abapderived_types_keys_identifiers]] 입니다.

## 관련 항목

- [[abapderived_types_tky]]
- [[abapderived_types_is_draft]]
- [[abapderived_types_keys_identifiers]]
- [[abenbdl_with_draft]]
- [[abenbdl_draft_action]]
- [[abenderived_types_isdraft_abexa]]
- [[abenderived_types_key_abexa]]
