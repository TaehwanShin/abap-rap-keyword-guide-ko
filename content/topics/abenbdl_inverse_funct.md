---
title: inverse function
summary: 외래 키 값을 받아, 그 값을 외래 키로 가진 연관 소스 인스턴스를 모두 돌려주는 static function 입니다.
keywords: inverse function, 인버스 함수, 역함수, 외래 키, foreign key, association, 연관 관계, 비표준 작업, result selective, target-resolved, 연관 관계로 읽기
---

## 문법

```syntax
...{
        [internal]
        inverse function FunctionName
        [result selective [cardinality] $self];
   }
```

## 설명

inverse function 은 외래 키 association 에 정의하는 **static function** 입니다. 그 association 의 외래 키 값을 하나 주면, 외래 키가 그 값과 같은 연관 소스 entity(엔터티)의 인스턴스를 모두 돌려줍니다.

다른 static function 처럼 EML 에서 따로 불러 쓸 수 있습니다. 하지만 주된 쓰임새는 다른 BO 로 가는 대상 해석(target-resolved) association 에서 **managed read-by-association 이 되게 하는 것**입니다.

### 출력 매개변수

출력 매개변수는 적어도 되고 안 적어도 됩니다.

- 적을 때의 모양은 `result selective [cardinality] $self` 입니다.
- `cardinality` 에는 `[0..1]`, `[0..*]`, `[1]` 을 쓸 수 있습니다.
- 적지 않으면 `result selective [1] $self` 로 봅니다.

출력 매개변수의 자세한 내용은 [[abenbdl_action_output_para]] 에 있습니다.

### 추가 구문

- [[abenbdl_internal|internal]] : BO 구현 안에서만 부를 수 있게 합니다.

### 어디에서 쓸 수 있나

- managed RAP BO : managed RAP BO provider(제공자)가 모두 처리하므로 behavior pool(동작 풀)이 필요 없습니다. 다만 association 이 `unmanaged` 면 직접 구현합니다.
- unmanaged RAP BO : behavior pool 의 handler method(핸들러 메서드)에 구현해야 합니다. association 이 `managed` 면 누가 처리하는지가 association 종류에 따라 갈립니다. 대상 해석 association 은 managed RAP BO provider 가 처리합니다. 소스 해석 association 은 active(활성) 인스턴스의 작업을 직접 구현해야 하고, draft 를 쓰는 BO 의 draft 인스턴스만 provider 가 처리합니다. [[abenbdl_assoc_impl_type]] 참고.
- projection BDEF 와 RAP BO interface : base BDEF(기반 BDEF) 의 것을 다시 씁니다. association 에 `use` 를 쓰고 그 안에 작업을 다시 나열합니다. [[abenbdl_use_projection]] 참고.

## 예제

여행의 `AgencyID` 는 여행사를 가리키는 외래 키입니다. association `_Agency` 에 inverse function 을 붙입니다.

```bdl
managed implementation in class zbp_r_travel unique;
strict ( 2 );

define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( instance )
{
  create;
  update;
  delete;
  field ( readonly : update ) TravelID;

  association _Agency
  {
    inverse function travelsOfAgency;
  }
}
```

function 이므로 `READ ENTITIES ... EXECUTE` 로 부릅니다. 대상(여행사)의 키를 `%param` 에 넣습니다.

```abap
READ ENTITIES OF zr_travel
  ENTITY travel
    EXECUTE travelsofagency FROM VALUE #(
      ( %cid            = 'c1'
        %param-agencyid = '070001' ) )
  RESULT DATA(lt_result).
```

`AgencyID` 가 `070001` 인 여행이 결과로 돌아옵니다. 결과의 줄마다 요청할 때 넣은 `%cid` 와, 찾은 여행 인스턴스를 담은 `%param` 이 들어 있습니다.

## 알아두기

- static function 이므로 특정 인스턴스의 키 없이 부릅니다. 입력은 `%param` 에 넣는 외래 키 값입니다.
- [[abenbdl_association|association 선언]]에 `using TargetEntity \_ReverseAssoc` 로 역방향 association 을 적으면, 그 역방향 association 에 정의한 inverse function 이 대상 인스턴스의 키를 구하는 데 쓰입니다.

## 관련 항목

- [[abenbdl_assoc_nonstand_ops]]
- [[abenbdl_link_unlink_action]]
- [[abenbdl_association]]
- [[abenbdl_action_output_para]]
- [[abenbdl_function]]
- [[abenbdl_use_projection]]
