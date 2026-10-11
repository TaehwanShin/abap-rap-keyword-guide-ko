---
title: managed 인스턴스 필터 (with managed instance filter)
summary: projection 뷰나 interface 뷰의 WHERE 조건을 EML 과 OData 접근에도 적용해, 조건에 맞지 않는 인스턴스를 읽거나 바꾸지 못하게 합니다.
keywords: with managed instance filter, 관리형 인스턴스 필터, 인스턴스 필터, WHERE, 프로젝션 BDEF, 인터페이스 BDEF, FAILED, IN LOCAL MODE, GET PERMISSIONS, 보안, 결과 집합
---

## 문법

```syntax
...
with managed instance filter;
 ...
```

## 설명

projection BDEF 와 interface BDEF 에 붙이는 선택 사항입니다. behavior definition(동작 정의) 머리말에 적으며, 그 RAP BO 에 든 **모든 entity(엔터티)**에 적용됩니다.

이 추가 구문을 적으면, ABAP EML 이나 웹 클라이언트의 OData 요청으로 BDEF 에 접근할 때 기반 CDS 트랜잭션 쿼리나 CDS 트랜잭션 interface 의 `WHERE` 조건을 따집니다. active(활성) 인스턴스와 draft 인스턴스 모두에 적용됩니다.

적지 않으면 EML 이나 OData 로 접근할 때 `WHERE` 절을 **무시**합니다. 그러면 그 projection 이나 interface 의 결과 집합에 들지 않는 인스턴스도 읽고 바꿀 수 있습니다.

BDEF 안의 entity 에 `WHERE` 절이 없으면 이 추가 구문은 아무 효과가 없습니다. 나중에 `WHERE` 절을 넣는 순간부터 확인이 켜집니다.

### 무엇을 확인하나

다음 작업은 EML 이나 OData 호출 **전에** 인스턴스를 확인합니다.

- 읽기
- 수정
- 삭제
- 인스턴스에 묶인 RAP BO 작업 실행
- association 을 따라 읽기
- EML 권한 조회 ([[abapget_permissions]])

`WHERE` 절에 맞지 않는 인스턴스는 response parameter(응답 매개변수) `FAILED` 에 담겨 돌아옵니다([[abapeml_response]]). 그 작업의 handler method(핸들러 메서드)로는 넘어가지 않습니다.

### 확인하는 시점

`WHERE` 절 확인은 handler method 를 부르기 **전**, 그리고 augmentation **뒤**에 일어납니다. 그래서 RAP BO provider(제공자)는 augmentation 으로 들어온 요청을 고쳐 `WHERE` 절에 맞게 만들 수 있습니다. 예를 들어 projection 에서 필드를 `readonly` 로 정해 둔 경우에 쓸 수 있습니다.

### 작업별로 다른 점

- **수정** : 수정한 결과 인스턴스가 기반 CDS entity 의 `WHERE` 절에 더는 맞지 않게 되면, 그 projection 이나 interface BDEF 로는 그 인스턴스에 더 이상 작업할 수 없습니다.
- **생성, create-by-association** : managed RAP BO provider 는 이 두 작업에서 `WHERE` 절을 따지지 않습니다. 유효한 인스턴스만 만들어지도록 하는 일은 RAP BO provider 가 handler method 와 augmentation 으로 직접 챙겨야 합니다. 그래서 `WHERE` 조건에 맞지 않는 인스턴스도 만들 수는 있습니다. 다만 그 인스턴스에는 그 뒤로 아무 작업도 할 수 없습니다.
- **association 을 따라 읽기** : association 대상 인스턴스는 호출 **뒤에** 확인합니다. child entity(자식 엔터티)의 `WHERE` 절에 맞지 않는 인스턴스는 `RESULT` ([[abapeml_result]])와 `LINK` ([[abapread_entity_entities_op]])에서 빠집니다. `FAILED` 에는 들어가지 않습니다.

### projection 이 interface 위에 있을 때

projection BDEF 가 interface BDEF 위에 있고 양쪽 뷰에 모두 `WHERE` 절이 있으면, 필터가 켜지는지는 **요청받은 entity 쪽**이 정합니다. 예를 들어 projection BDEF 에만 이 추가 구문이 있고 RAP BO consumer(사용자)가 그 projection BDEF 를 요청하면, interface 의 `WHERE` 절과 projection 의 `WHERE` 절을 둘 다 따져 인스턴스를 걸러 냅니다.

### 쓸 수 있는 곳

projection BDEF, RAP BO interface

## 예제

상태가 열림(`O`)인 여행만 보여 주는 projection 뷰입니다.

```cds
@EndUserText.label: '열린 여행만 보여 주는 projection'
@AccessControl.authorizationCheck: #NOT_REQUIRED
define root view entity ZC_Travel
  provider contract transactional_query
  as projection on ZR_Travel
{
  key TravelID,
      AgencyID,
      CustomerID,
      Status
}
where Status = 'O'
```

projection BDEF 에 필터를 켭니다.

```bdl
projection;
strict ( 2 );
with managed instance filter;

define behavior for ZC_Travel alias Travel
{
  use create;
  use update;
  use delete;
}
```

여행 `00000001` 과 `00000002` 는 상태가 `O`, `00000003` 은 `X` 라고 봅니다.

```abap
" ABAP SQL 로 읽기: WHERE 절이 늘 적용된다
SELECT FROM zc_travel
  FIELDS travelid, agencyid, status
  INTO TABLE @DATA(lt_select).

" EML 로 읽기
READ ENTITIES OF zc_travel
  ENTITY travel
    ALL FIELDS WITH VALUE #( ( travelid = '00000001' )
                             ( travelid = '00000002' )
                             ( travelid = '00000003' ) )
  RESULT DATA(lt_read)
  FAILED DATA(ls_failed).
```

- 필터를 **켰을 때** : `lt_select` 와 `lt_read` 에 든 여행이 같습니다. 둘 다 `00000001`, `00000002` 뿐입니다. `00000003` 은 `ls_failed-travel` 에 담깁니다.
- 필터를 **껐을 때** (`with managed instance filter;` 줄을 뺐을 때) : `lt_select` 에는 두 건만 있지만 `lt_read` 에는 `00000003` 까지 세 건이 들어옵니다. `WHERE` 절이 걸러 내야 할 인스턴스가 EML 로는 읽힙니다.

## 알아두기

- 이 추가 구문이 없으면 projection 에 들지 않는 인스턴스를 EML 이나 OData 로 읽고 바꿀 수 있습니다. 보안 위험이 될 수 있습니다.
- 정적 RAP BO 작업을 실행할 때는 `WHERE` 절을 따지지 않습니다.
- `IN LOCAL MODE` ([[abapin_local_mode]])로 접근하면 이 추가 구문은 아무 효과가 없습니다.

## 관련 항목

- [[abenbdl_bdef_projection_header]]
- [[abenbdl_bo_interface_header]]
- [[abenbdl_augment_projection]]
- [[abapeml_response]]
- [[abapget_permissions]]
- [[abapin_local_mode]]
