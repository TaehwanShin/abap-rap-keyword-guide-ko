---
title: 예제 - %fail 쓰기
summary: 권한·feature control handler method 가 failed 에 실패 원인을 적고, RAP BO consumer 가 %fail-cause 로 그 원인(READONLY, UNAUTHORIZED, NOT_FOUND)을 읽는 예제입니다.
keywords: %fail, %fail-cause, failed, FAILED, cause, NOT_FOUND, UNAUTHORIZED, READONLY, get_instance_authorizations, get_instance_features, MODIFY ENTITIES, READ ENTITIES, 실패 원인, 예제
---

## 설명

managed([[abenbdl_impl_type]]) RAP BO 에서 [[abapderived_types_fail]] 을 쓰는 법을 보여 주는 예제입니다. `failed` 응답의 줄마다 들어 있는 `%fail-cause` 로, 그 인스턴스가 **왜** 실패했는지 알 수 있습니다.

데이터 모델은 root entity(루트 엔터티)와 child entity(자식 엔터티)입니다. child entity 는 이 예제에서 쓰지 않습니다. BDEF 에서 root entity 는 `authorization master ( instance, global )` 이고, 수정에 `( features : instance )` 가 걸려 있습니다.

실패 원인은 behavior pool(동작 풀)의 두 handler method(핸들러 메서드)가 적어 넣습니다.

- `get_instance_authorizations` : 인스턴스의 어떤 필드가 특정 값이면 수정과 삭제를 막습니다. 두 작업을 권한 없음(`unauthorized`)으로 표시하고, 그에 맞는 `%fail-cause` 와 인스턴스 키를 `failed` 에 넣습니다.
- `get_instance_features` : 인스턴스의 어떤 필드가 특정 값이면 수정을 막습니다. 수정을 readonly 로 표시하고, 그에 맞는 `%fail-cause` 와 인스턴스 키를 `failed` 에 넣습니다.

## 예제

같은 내용을 공통 예제 모델로 옮겼습니다. 취소된 여행(`Status = 'X'`)은 고치거나 지울 권한이 없고, 승인된 여행(`Status = 'A'`)은 더 고칠 수 없게 합니다.

```abap
METHOD get_instance_authorizations.
  READ ENTITIES OF zr_travel IN LOCAL MODE
    ENTITY travel
      FIELDS ( status ) WITH CORRESPONDING #( keys )
    RESULT DATA(lt_travel).

  LOOP AT lt_travel INTO DATA(ls_travel) WHERE status = 'X'.
    APPEND VALUE #( %tky    = ls_travel-%tky
                    %update = if_abap_behv=>auth-unauthorized
                    %delete = if_abap_behv=>auth-unauthorized ) TO result.
    " 실패 원인: 권한 없음
    APPEND VALUE #( %tky        = ls_travel-%tky
                    %fail-cause = if_abap_behv=>cause-unauthorized )
      TO failed-travel.
  ENDLOOP.
ENDMETHOD.

METHOD get_instance_features.
  READ ENTITIES OF zr_travel IN LOCAL MODE
    ENTITY travel
      FIELDS ( status ) WITH CORRESPONDING #( keys )
    RESULT DATA(lt_travel).

  LOOP AT lt_travel INTO DATA(ls_travel) WHERE status = 'A'.
    APPEND VALUE #( %tky    = ls_travel-%tky
                    %update = if_abap_behv=>fc-o-disabled ) TO result.
    " 실패 원인: readonly
    APPEND VALUE #( %tky        = ls_travel-%tky
                    %fail-cause = if_abap_behv=>cause-readonly )
      TO failed-travel.
  ENDLOOP.
ENDMETHOD.
```

RAP BO consumer(사용자)는 요청을 보낸 뒤 `failed` 에서 원인을 읽습니다.

```abap
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    UPDATE FIELDS ( agencyid )
      WITH VALUE #( ( %key-travelid = '00000001' agencyid = '070009' )
                    ( %key-travelid = '00000002' agencyid = '070009' ) )
    DELETE FROM VALUE #( ( %key-travelid = '00000004' ) )
  MAPPED DATA(ls_mapped)
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).

LOOP AT ls_failed-travel INTO DATA(ls_fail).
  CASE ls_fail-%fail-cause.
    WHEN if_abap_behv=>cause-unauthorized.
      " 권한이 없어 처리하지 못한 여행
    WHEN if_abap_behv=>cause-readonly.
      " readonly 이라 고치지 못한 여행
    WHEN if_abap_behv=>cause-not_found.
      " 없는 여행
  ENDCASE.
ENDLOOP.

" 실패하지 않은 인스턴스만 저장된다
COMMIT ENTITIES.
```

### 실행 결과

SAP 예제 클래스는 EML 요청을 세 번 보내고, 그때마다 `failed` 응답([[abaptype_response_for]])의 내용을 출력합니다.

1. **생성** : 인스턴스를 여러 개 만들고 `COMMIT ENTITIES`([[abapcommit_entities]])로 저장합니다. 실패한 인스턴스가 없어 `failed` 는 비어 있습니다. 새 인스턴스가 모두 데이터베이스 테이블에 들어간 것을 출력으로 확인합니다.
2. **수정과 삭제** : 몇몇 인스턴스를 고치고 지웁니다. `get_instance_authorizations` 와 `get_instance_features` 에 넣은 조건 때문에 몇몇 인스턴스는 고치거나 지울 수 없습니다. 두 메서드가 `failed` 를 채우므로, 처리하지 못한 인스턴스마다 실패 원인이 나옵니다. 여기서 `%fail-cause` 는 `READONLY` 와 `UNAUTHORIZED` 입니다. `COMMIT ENTITIES` 는 실패하지 않은 인스턴스만 저장합니다.
3. **읽기** : 인스턴스 여러 개를 읽습니다. 요청한 키 가운데 일부는 데이터베이스 테이블에 없으므로 `failed` 에 줄이 생깁니다. 여기서 `%fail-cause` 는 `NOT_FOUND` 입니다. 읽은 결과도 함께 출력합니다.

## 알아두기

- 3번 단계의 `NOT_FOUND` 는 요청한 인스턴스가 데이터베이스 테이블에 없어서 나온 값입니다. 2번 단계의 `READONLY` 와 `UNAUTHORIZED` 는 handler method 가 `failed` 에 직접 적어 넣은 값입니다.
- 실패 원인 값은 interface `IF_ABAP_BEHV` 에 정의되어 있습니다.

## 관련 항목

- [[abapderived_types_fail]]
- [[abaptype_response_for]]
- [[abenbdl_authorization]]
- [[abenbdl_actions_fc]]
- [[abapderived_types_update]]
- [[abapderived_types_delete]]
- [[abapcommit_entities]]
